//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  CodingSystem,
  FHIRExtensionUrl,
  FHIRMedication,
  FHIRMedicationRequest,
  type MedicationClass,
  optionalish,
  QuantityUnit,
} from "@stanfordbdhg/engagehf-models";
import { type Extension, type FhirResource } from "fhir/r4b.js";
import { logger } from "firebase-functions";
import { z } from "zod";
import { RxNormApi } from "./rxNormApi.js";
import {
  type RxNormConceptProperty,
  type RxTermInfo,
  rxTermInfo,
} from "./rxNormModels.js";
import { capitalize } from "../../../../extensions/string.js";

export const medicationDailyDoseSpecificationSchema = z.object({
  drug: z.string(),
  frequency: z.number(),
  quantity: z.number(),
});

export type MedicationDailyDoseSpecification = z.output<
  typeof medicationDailyDoseSpecificationSchema
>;

export const medicationSpecificationSchema = z.object({
  code: z.string(),
  brandNames: z.string().array(),
  minimumDailyDose: optionalish(medicationDailyDoseSpecificationSchema),
  targetDailyDose: optionalish(medicationDailyDoseSpecificationSchema),
  ingredients: optionalish(z.string().array()),
  drugs: optionalish(z.string().array()),
  fallbackTerms: optionalish(z.record(z.string(), rxTermInfo)),
});

export type MedicationSpecification = z.output<
  typeof medicationSpecificationSchema
>;

export const medicationClassSpecificationSchema = z.object({
  key: z.string(),
  medications: medicationSpecificationSchema.array(),
});

export type MedicationClassSpecification = z.output<
  typeof medicationClassSpecificationSchema
>;

export class RxNormService {
  // Properties

  private readonly api = new RxNormApi();

  // Methods

  async buildFHIRCollections(
    medicationClasses: Map<string, MedicationClass>,
    specification: MedicationClassSpecification[],
  ): Promise<{
    medications: Record<string, FHIRMedication>;
    drugs: Record<string, Record<string, FHIRMedication>>;
  }> {
    const medications: Record<string, FHIRMedication> = {};
    const drugs: Record<string, Record<string, FHIRMedication>> = {};

    for (const medicationClass of specification) {
      logger.debug(`Processing medication class ${medicationClass.key}...`);

      for (const medication of medicationClass.medications) {
        const medicationName = await this.api.getRxNormName(medication.code);

        let ingredients = [{ name: medicationName, rxcui: medication.code }];
        if (medication.ingredients) {
          ingredients = [];
          for (const ingredientRxcui of medication.ingredients) {
            try {
              const ingredientName =
                await this.api.getRxNormName(ingredientRxcui);
              ingredients.push({
                name: ingredientName,
                rxcui: ingredientRxcui,
              });
            } catch (error) {
              logger.error(
                `Error processing ingredient ${ingredientRxcui}: ${JSON.stringify(error)}`,
              );
              throw error;
            }
          }
        }
        logger.info(`Processing medication ${medicationName}...`);

        drugs[medication.code] = {};

        try {
          if (medication.drugs) {
            for (const drugRxcui of medication.drugs) {
              try {
                const fhirDrug = await this.buildFHIRDrug(
                  drugRxcui,
                  ingredients,
                  medication.fallbackTerms?.[drugRxcui] ?? {},
                );
                drugs[medication.code][drugRxcui] = fhirDrug;
              } catch (error) {
                logger.error(
                  `Error processing drug ${drugRxcui}: ${JSON.stringify(error)}`,
                );
                throw error;
              }
            }
          } else {
            const medicationDrugs = await this.getDrugsContaining(
              medication.code,
            );
            logger.info(
              `Found ${medicationDrugs.length} drugs for ${medication.code}`,
            );
            for (const drug of medicationDrugs) {
              logger.info(`Processing drug ${JSON.stringify(drug)}...`);
              try {
                const fhirDrug = await this.buildFHIRDrug(
                  drug.rxcui,
                  ingredients,
                  medication.fallbackTerms?.[drug.rxcui] ?? {},
                );
                if (fhirDrug.data.id) {
                  drugs[medication.code][fhirDrug.data.id] = fhirDrug;
                }
              } catch (error) {
                logger.error(
                  `Error processing drug ${drug.rxcui}: ${JSON.stringify(error)}`,
                );
                throw error;
              }
            }
          }
        } catch (error) {
          logger.error(
            `Error processing medication ${medication.code}: ${JSON.stringify(error)}`,
          );
          throw error;
        }

        const fhirMedication = this.buildFHIRMedication(
          medication.code,
          medicationName,
          medication.brandNames,
          medicationClass.key,
          medicationClasses,
          ingredients,
          medication.minimumDailyDose,
          medication.targetDailyDose,
          drugs[medication.code],
        );
        medications[medication.code] = fhirMedication;
      }
    }

    return { medications, drugs };
  }

  // Helpers - Build

  private buildFHIRMedication(
    rxcui: string,
    name: string,
    brandNames: string[],
    medicationClassId: string,
    medicationClasses: Map<string, MedicationClass>,
    ingredients: Array<{ rxcui: string; name: string }>,
    minimumDailyDose: MedicationDailyDoseSpecification | undefined,
    targetDailyDose: MedicationDailyDoseSpecification | undefined,
    drugs: Record<string, FHIRMedication>,
  ): FHIRMedication {
    const containedResources: FhirResource[] = [];
    const extensions: Extension[] = [];
    if (medicationClassId) {
      const localizedName = medicationClasses.get(medicationClassId)?.name;
      extensions.push({
        url: FHIRExtensionUrl.medicationClass,
        valueReference: {
          reference: `medicationClasses/${medicationClassId}`,
          display: localizedName?.localize(), // TODO: What to do about localization here? Ignore?
        },
      });
    }
    if (minimumDailyDose) {
      const containedId = "minimumDailyDose";
      const containedDisplay =
        drugs[minimumDailyDose.drug].data.code?.coding?.at(0)?.display;
      extensions.push({
        url: FHIRExtensionUrl.minimumDailyDose,
        valueReference: {
          reference: "#" + containedId,
          display: containedDisplay,
        },
      });
      containedResources.push(
        FHIRMedicationRequest.create({
          id: containedId,
          medicationReference: `medications/${rxcui}/drugs/${minimumDailyDose.drug}`,
          medicationReferenceDisplay: containedDisplay,
          extension: [
            ...(drugs[minimumDailyDose.drug].data.ingredient ?? []).map(
              (ingredient) => {
                const value =
                  QuantityUnit.mg.valueOf(ingredient.strength?.numerator) ?? 0;
                const quantity = QuantityUnit.mg.fhirQuantity(
                  value *
                    minimumDailyDose.quantity *
                    minimumDailyDose.frequency,
                );
                return {
                  url: FHIRExtensionUrl.totalDailyDose,
                  valueQuantity: quantity,
                };
              },
            ),
          ],
          frequencyPerDay: minimumDailyDose.frequency,
          quantity: minimumDailyDose.quantity,
        }).data,
      );
    }
    if (targetDailyDose) {
      const containedId = `targetDailyDose`;
      const containedDisplay =
        drugs[targetDailyDose.drug].data.code?.coding?.at(0)?.display;
      extensions.push({
        url: FHIRExtensionUrl.targetDailyDose,
        valueReference: {
          reference: "#" + containedId,
          display: containedDisplay,
        },
      });
      containedResources.push(
        FHIRMedicationRequest.create({
          id: containedId,
          medicationReference: `medications/${rxcui}/drugs/${targetDailyDose.drug}`,
          medicationReferenceDisplay: containedDisplay,
          extension: [
            ...(drugs[targetDailyDose.drug].data.ingredient ?? []).map(
              (ingredient) => {
                const value =
                  QuantityUnit.mg.valueOf(ingredient.strength?.numerator) ?? 0;
                const quantity = QuantityUnit.mg.fhirQuantity(
                  value * targetDailyDose.quantity * targetDailyDose.frequency,
                );
                return {
                  url: FHIRExtensionUrl.totalDailyDose,
                  valueQuantity: quantity,
                };
              },
            ),
          ],
          frequencyPerDay: targetDailyDose.frequency,
          quantity: targetDailyDose.quantity,
        }).data,
      );
    }

    for (const brandName of brandNames) {
      extensions.push({
        url: FHIRExtensionUrl.brandName,
        valueString: brandName,
      });
    }

    return new FHIRMedication({
      resourceType: "Medication",
      id: rxcui,
      contained: containedResources,
      extension: extensions,
      code: {
        coding: [
          {
            system: CodingSystem.rxNorm,
            code: rxcui,
            display: capitalize(name),
          },
        ],
      },
      ingredient:
        ingredients.length > 1 ?
          ingredients.map((ingredient) => ({
            itemCodeableConcept: {
              coding: [
                {
                  system: CodingSystem.rxNorm,
                  code: ingredient.rxcui,
                  display: capitalize(ingredient.name),
                },
              ],
            },
          }))
        : undefined,
    });
  }

  private async buildFHIRDrug(
    rxcui: string,
    ingredients: Array<{ rxcui: string; name: string }>,
    fallbackTerms: RxTermInfo | undefined,
  ): Promise<FHIRMedication> {
    let rxTermInfo = await this.api.getAllRxTermInfo(rxcui);
    if (rxTermInfo === undefined || Object.entries(rxTermInfo).length === 0) {
      logger.warn(
        `Error getting term info for ${rxcui}. Using fallback terms...`,
      );
      rxTermInfo = fallbackTerms ?? {};
      if (Object.entries(rxTermInfo).length === 0) {
        throw new Error(`No fallback terms provided for RXCUI ${rxcui}.`);
      }
    }
    const amounts = this.removingSuffix(
      (rxTermInfo.strength ?? "").toUpperCase(),
      "MG",
    )
      .split("-")
      .map(parseFloat);
    const display = rxTermInfo.displayName ?? rxTermInfo.fullName;
    if (!display) {
      throw new Error(`Missing display name for RXCUI ${rxcui}.`);
    }
    return new FHIRMedication({
      resourceType: "Medication",
      id: rxcui,
      code: {
        coding: [
          {
            system: CodingSystem.rxNorm,
            code: rxcui,
            display: capitalize(display),
          },
        ],
      },
      form: {
        coding: [
          {
            system: CodingSystem.rxNorm,
            code: rxTermInfo.rxnormDoseForm,
            display: rxTermInfo.rxnormDoseForm,
          },
        ],
        text: rxTermInfo.rxnormDoseForm,
      },
      ingredient: ingredients.map((ingredient, index) => ({
        itemCodeableConcept: {
          coding: [
            {
              system: CodingSystem.rxNorm,
              code: ingredient.rxcui,
              display: capitalize(ingredient.name),
            },
          ],
        },
        strength: {
          numerator: QuantityUnit.mg.fhirQuantity(amounts[index]),
          denominator: {
            value: 1,
          },
        },
      })),
    });
  }

  // Helpers

  private async getDrugsContaining(
    rxcui: string,
  ): Promise<RxNormConceptProperty[]> {
    const ingredientsData = await this.api.getRelated(rxcui, "ingredient_of");
    const ingredients =
      ingredientsData.relatedGroup?.conceptGroup.find(
        (group) => group.tty === "SCDC",
      )?.conceptProperties ?? [];
    const allDrugs = [];
    for (const ingredient of ingredients) {
      const drugData = await this.api.getRelated(
        ingredient.rxcui,
        "constitutes",
      );
      const drugs = drugData.relatedGroup?.conceptGroup.find(
        (group) => group.tty === "SCD",
      )?.conceptProperties;
      allDrugs.push(...(drugs ?? []));
    }
    return allDrugs;
  }

  private removingSuffix(string: string, suffix: string, trim = true): string {
    const input = trim ? string.trim() : string;
    const output =
      input.endsWith(suffix) ? input.slice(0, -suffix.length).trim() : input;
    return trim ? output.trim() : output;
  }
}
