//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import * as https from 'https'
import { z } from 'zod'
import { capitalize } from '../../../extensions/string.js'
import {
  type FHIRExtension,
  FHIRMedicationRequest,
} from '../../../models/fhir/baseTypes/fhirElement.js'
import { FHIRMedication } from '../../../models/fhir/fhirMedication.js'
import { optionalish } from '../../../models/helpers/optionalish.js'
import { type MedicationClass } from '../../../models/types/medicationClass.js'
import { CodingSystem, FHIRExtensionUrl } from '../../codes.js'
import { QuantityUnit } from '../../fhir/quantityUnit.js'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

export const medicationDailyDoseSpecificationSchema = z.object({
  drug: z.string(),
  frequency: z.number(),
  quantity: z.number(),
})

export type MedicationDailyDoseSpecification = z.output<
  typeof medicationDailyDoseSpecificationSchema
>

export const rxTermInfoSpecificationSchema = z.object({
  displayName: optionalish(z.string()),
  fullName: optionalish(z.string()),
  rxnormDoseForm: optionalish(z.string()),
  strength: optionalish(z.string()),
})

export type RxTermInfo = z.output<typeof rxTermInfoSpecificationSchema>

export const medicationSpecificationSchema = z.object({
  code: z.string(),
  brandNames: z.string().array(),
  minimumDailyDose: optionalish(medicationDailyDoseSpecificationSchema),
  targetDailyDose: optionalish(medicationDailyDoseSpecificationSchema),
  ingredients: optionalish(z.string().array()),
  drugs: optionalish(z.string().array()),
  fallbackTerms: optionalish(
    z.record(z.string(), rxTermInfoSpecificationSchema),
  ),
})

export type MedicationSpecification = z.output<
  typeof medicationSpecificationSchema
>

export const medicationClassSpecificationSchema = z.object({
  key: z.string(),
  medications: medicationSpecificationSchema.array(),
})

export type MedicationClassSpecification = z.output<
  typeof medicationClassSpecificationSchema
>

export class RxNormService {
  // Methods

  async buildFHIRCollections(
    medicationClasses: Map<string, MedicationClass>,
    specification: MedicationClassSpecification[],
  ): Promise<{
    medications: Record<string, FHIRMedication>
    drugs: Record<string, Record<string, FHIRMedication>>
  }> {
    const medications: Record<string, FHIRMedication> = {}
    const drugs: Record<string, Record<string, FHIRMedication>> = {}

    for (const medicationClass of specification) {
      console.log(`Processing medication class ${medicationClass.key}...`)

      for (const medication of medicationClass.medications) {
        const medicationName = await this.getRxNormName(medication.code)

        let ingredients = [{ name: medicationName, rxcui: medication.code }]
        if (medication.ingredients) {
          ingredients = []
          for (const ingredientRxcui of medication.ingredients) {
            try {
              const ingredientName = await this.getRxNormName(ingredientRxcui)
              ingredients.push({ name: ingredientName, rxcui: ingredientRxcui })
            } catch (error) {
              console.error(
                `Error processing ingredient ${ingredientRxcui}: ${JSON.stringify(error)}`,
              )
            }
          }
        }
        console.log(`Processing medication ${medicationName}...`)

        drugs[medication.code] = {}

        try {
          if (medication.drugs) {
            for (const drugRxcui of medication.drugs) {
              try {
                const fhirDrug = await this.buildFHIRDrug(
                  drugRxcui,
                  ingredients,
                  medication.fallbackTerms?.[drugRxcui] ?? {},
                )
                drugs[medication.code][drugRxcui] = fhirDrug
              } catch (error) {
                console.error(
                  `Error processing drug ${drugRxcui}: ${JSON.stringify(error)}`,
                )
              }
            }
          } else {
            const medicationDrugs = await this.getDrugsContaining(
              medication.code,
            )
            console.log(
              `Found ${medicationDrugs.length} drugs for ${medication.code}`,
            )
            for (const drug of medicationDrugs) {
              console.log(`Processing drug ${JSON.stringify(drug)}...`)
              try {
                const fhirDrug = await this.buildFHIRDrug(
                  drug.id,
                  ingredients,
                  medication.fallbackTerms?.[drug.id] ?? {},
                )
                if (fhirDrug.id) {
                  drugs[medication.code][fhirDrug.id] = fhirDrug
                }
              } catch (error) {
                console.error(
                  `Error processing drug ${drug.rxcui}: ${JSON.stringify(error)}`,
                )
              }
            }
          }
        } catch (error) {
          console.error(
            `Error processing medication ${medication.code}: ${JSON.stringify(error)}`,
          )
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
        )
        medications[medication.code] = fhirMedication
      }
    }

    return { medications, drugs }
  }

  async logDrugs(medicationClasses: MedicationClassSpecification[]) {
    for (const medicationClass of medicationClasses) {
      for (const medication of medicationClass.medications) {
        try {
          await this.logDrugsContainingMedication(medication.code)
        } catch (error) {
          console.error(
            `Error processing medication ${medication.code}: ${JSON.stringify(error)}`,
          )
        }
      }
    }
  }

  buildFHIRMedication(
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
    const result = {
      resourceType: 'Medication',
      id: rxcui,
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
      extension: [] as FHIRExtension[],
    }
    if (medicationClassId) {
      const localizedName = medicationClasses.get(medicationClassId)?.name
      result.extension.push({
        url: FHIRExtensionUrl.medicationClass,
        valueReference: {
          reference: `medicationClasses/${medicationClassId}`,
          display: localizedName?.localize(), // TODO: What to do about localization here? Ignore?
        },
      })
    }
    if (minimumDailyDose) {
      result.extension.push({
        url: FHIRExtensionUrl.minimumDailyDose,
        /*
        valueMedicationRequest: new FHIRMedicationRequest({
          resourceType: 'MedicationRequest',
          medicationReference: {
            reference: `medications/${rxcui}/drugs/${minimumDailyDose.drug}`,
            display: drugs[minimumDailyDose.drug].code?.coding?.at(0)?.display,
          },
          extension: [
            {
              url: FHIRExtensionUrl.totalDailyDose,
              valueQuantities: drugs[minimumDailyDose.drug].ingredient?.map(
                (ingredient) => {
                  const value =
                    QuantityUnit.mg.valueOf(ingredient.strength?.numerator) ?? 0
                  return {
                    ...QuantityUnit.mg,
                    value:
                      value *
                      minimumDailyDose.quantity *
                      minimumDailyDose.frequency,
                  }
                },
              ),
            },
          ],
          dosageInstruction: [
            {
              timing: {
                repeat: {
                  frequency: minimumDailyDose.frequency,
                  period: 1,
                  periodUnit: 'd',
                },
              },
              doseAndRate: [
                {
                  doseQuantity: {
                    ...QuantityUnit.tablet,
                    value: minimumDailyDose.quantity,
                  },
                },
              ],
            },
          ],
        }),
        */
      })
    }
    if (targetDailyDose) {
      result.extension.push({
        url: FHIRExtensionUrl.targetDailyDose,
        valueMedicationRequest: new FHIRMedicationRequest({
          resourceType: 'MedicationRequest',
          medicationReference: {
            reference: `medications/${rxcui}/drugs/${targetDailyDose.drug}`,
            display: drugs[targetDailyDose.drug].code?.coding?.at(0)?.display,
          },
          extension: [
            {
              url: FHIRExtensionUrl.totalDailyDose,
              valueQuantities: drugs[targetDailyDose.drug].ingredient?.map(
                (ingredient) => {
                  const value =
                    QuantityUnit.mg.valueOf(ingredient.strength?.numerator) ?? 0
                  return {
                    ...QuantityUnit.mg,
                    value:
                      value *
                      targetDailyDose.quantity *
                      targetDailyDose.frequency,
                  }
                },
              ),
            },
          ],
          dosageInstruction: [
            {
              timing: {
                repeat: {
                  frequency: targetDailyDose.frequency,
                  period: 1,
                  periodUnit: 'd',
                },
              },
              doseAndRate: [
                {
                  doseQuantity: {
                    ...QuantityUnit.tablet,
                    value: targetDailyDose.quantity,
                  },
                },
              ],
            },
          ],
        }),
      })
    }

    for (const brandName of brandNames) {
      result.extension.push({
        url: FHIRExtensionUrl.brandName,
        valueString: brandName,
      })
    }
    return new FHIRMedication(result)
  }

  async buildFHIRDrug(
    rxcui: string,
    ingredients: Array<{ rxcui: string; name: string }>,
    fallbackTerms: any,
  ): Promise<FHIRMedication> {
    let rxTermInfo = await this.getAllRxTermInfo(rxcui)
    if (!rxTermInfo || Object.entries(rxTermInfo).length === 0) {
      console.error(
        `Error getting term info for ${rxcui}. Using fallback terms...`,
      )
      rxTermInfo = fallbackTerms ?? {}
    }
    const amounts = this.removingSuffix(
      (rxTermInfo?.strength ?? '').toUpperCase(),
      'MG',
    )
      .split('-')
      .map(parseFloat)
    return new FHIRMedication({
      resourceType: 'Medication',
      id: rxcui,
      code: {
        coding: [
          {
            system: CodingSystem.rxNorm,
            code: rxcui,
            display: capitalize(
              rxTermInfo?.displayName ?? rxTermInfo?.fullName ?? '',
            ),
          },
        ],
      },
      form: {
        coding: [
          {
            system: CodingSystem.rxNorm,
            code: rxTermInfo?.rxnormDoseForm,
            display: rxTermInfo?.rxnormDoseForm,
          },
        ],
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
          numerator: {
            ...QuantityUnit.mg,
            value: amounts[index],
          },
          denominator: {
            value: 1,
          },
        },
      })),
    })
  }

  // Methods - API

  // docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.findRxcuiById.html
  async findRxcuiById(
    idType: string,
    id: string,
    allSources = false,
  ): Promise<string> {
    const response = await this.get(
      `rxcui.json?idtype=${idType}&id=${id}&allsrc=${allSources ? 1 : 0}`,
    )
    return response.idGroup.rxnormId
  }

  // docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.getAllProperties.html
  async getAllProperties(rxcui: string, props: string[]): Promise<any> {
    return this.get(`rxcui/${rxcui}/allProperties.json?prop=${props.join('+')}`)
  }

  // docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.getAllRelatedInfo.html
  async getAllRelatedInfo(rxcui: string, expand: string[]): Promise<any> {
    return this.get(`rxcui/${rxcui}/allrelated.json?expand=${expand.join('+')}`)
  }

  // docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.getDrugs.html
  async getDrugs(name: string, expand: string[]): Promise<any> {
    return this.get(`drugs.json?name=${name}&expand=${expand.join('+')}`)
  }

  // docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.getRxProperty.html
  async getRxProperty(rxcui: string, prop: string): Promise<any> {
    return this.get(`rxcui/${rxcui}/property.json?propName=${prop}`)
  }

  // docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.getRxNormName.html
  async getRxNormName(rxcui: string): Promise<string> {
    const data = await this.get(`rxcui/${rxcui}.json`)
    return data.idGroup.name as string
  }

  // docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxTerms.getAllRxTermInfo.html
  async getAllRxTermInfo(rxcui: string): Promise<RxTermInfo | undefined> {
    const data = await this.get(`RxTerms/rxcui/${rxcui}/allinfo.json`)
    return data.rxtermsProperties as RxTermInfo | undefined
  }

  // docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.getRelatedByType.html
  async getRelatedDrugs(rxcui: string): Promise<any> {
    const data = await this.get(`RxTerms/rxcui/${rxcui}/related.json?tty=SCD`)
    return data.relatedGroup.conceptGroup.filter(
      (group: { tty: string }) => group.tty === 'SCD',
    )[0].conceptProperties
  }

  async getDrugsContaining(rxcui: string) {
    const ingredientResponse = await this.get(
      `rxcui/${rxcui}/related.json?rela=ingredient_of`,
    )
    const ingredientsData = JSON.parse(ingredientResponse.body)
    const ingredients =
      ingredientsData.relatedGroup.conceptGroup?.filter(
        (group: { tty: string }) => group.tty === 'SCDC',
      )[0]?.conceptProperties ?? []
    const allDrugs = []
    for (const ingredient of ingredients) {
      const drugData = await this.get(
        `rxcui/${ingredient.rxcui}/related.json?rela=constitutes`,
      )
      const drugs = drugData.relatedGroup.conceptGroup.filter(
        (group: { tty: string }) => group.tty === 'SCD',
      )[0].conceptProperties
      allDrugs.push(...drugs)
    }
    return allDrugs
  }

  // Helpers

  private async get(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = https.get(
        'https://rxnav.nlm.nih.gov/REST/' + path,
        (response) => {
          let body = Buffer.alloc(0)
          response.on(
            'data',
            (chunk: Buffer) => (body = Buffer.concat([body, chunk])),
          )
          response.on('error', reject)
          response.on('end', () => {
            const statusCode = response.statusCode ?? 500
            if (statusCode >= 200 && statusCode <= 299) {
              resolve(JSON.parse(body.toString('utf8')))
            } else {
              reject(
                Error(
                  `Request failed with status code ${response.statusCode})`,
                ),
              )
            }
          })
        },
      )
      request.on('error', reject)
      request.end()
    })
  }

  private async logDrugsContainingMedication(rxcui: string) {
    const medicationName = await this.getRxNormName(rxcui)
    console.log(`Drugs containing ${rxcui}: ${medicationName}`)
    const drugsResponse = await this.getDrugs(medicationName, [])
    const drugs = drugsResponse.drugGroup.conceptGroup
      .filter((group: { tty: string }) => group.tty === 'SCD')[0]
      .conceptProperties.sort((a: { name: string }, b: { name: string }) =>
        a.name.localeCompare(b.name),
      )
    for (const drug of drugs) {
      console.log(`  -> ${drug.rxcui}: ${drug.name}`)
    }
  }

  private removingSuffix(string: string, suffix: string, trim = true) {
    const input = trim ? string.trim() : string
    const output =
      input.endsWith(suffix) ? input.slice(0, -suffix.length).trim() : input
    return trim ? output.trim() : output
  }
}
