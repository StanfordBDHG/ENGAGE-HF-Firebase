//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import * as https from 'https'
import { type FHIRExtension } from '../../../models/fhir/baseTypes.js'
import { type FHIRMedication } from '../../../models/fhir/medication.js'
import { CodingSystem, FHIRExtensionUrl } from '../../codes.js'
import { QuantityUnit } from '../../fhir/quantityUnit.js'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

export interface MedicationClassSpecification {
  key: string
  medications: MedicationSpecification[]
}

export interface MedicationDailyDoseSpecification {
  drug: string
  frequency: number
  quantity: number
}

export interface MedicationSpecification {
  code: string
  minimumDailyDose?: MedicationDailyDoseSpecification
  targetDailyDose?: MedicationDailyDoseSpecification
  ingredients?: string[]
  drugs?: string[]
  fallbackTerms?: Record<string, RxTermInfo>
}

export interface RxTermInfo {
  displayName?: string
  fullName?: string
  rxnormDoseForm?: string
  strength?: string
}

export class RxNormService {
  // Methods

  async buildFHIRCollections(
    medicationClasses: MedicationClassSpecification[],
  ): Promise<{
    medications: Record<string, FHIRMedication>
    drugs: Record<string, Record<string, FHIRMedication>>
  }> {
    const medications: Record<string, FHIRMedication> = {}
    const drugs: Record<string, Record<string, FHIRMedication>> = {}

    for (const medicationClass of medicationClasses) {
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
          medicationClass.key,
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
    medicationClass: string,
    ingredients: Array<{ rxcui: string; name: string }>,
    minimumDailyDose: MedicationDailyDoseSpecification | undefined,
    targetDailyDose: MedicationDailyDoseSpecification | undefined,
    drugs: Record<string, FHIRMedication>,
  ): FHIRMedication {
    const result: FHIRMedication = {
      id: rxcui,
      code: {
        coding: [
          {
            system: CodingSystem.rxNorm,
            code: rxcui,
            display: name,
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
                  display: ingredient.name,
                },
              ],
            },
          }))
        : undefined,
      extension: [] as FHIRExtension[],
    }
    if (medicationClass) {
      result.extension?.push({
        url: FHIRExtensionUrl.medicationClass,
        valueReference: { reference: `medicationClasses/${medicationClass}` },
      })
    }
    if (minimumDailyDose) {
      result.extension?.push({
        url: FHIRExtensionUrl.minimumDailyDose,
        valueMedicationRequest: {
          medicationReference: {
            reference: `medications/${rxcui}/drugs/${minimumDailyDose.drug}`,
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
        },
      })
    }
    if (targetDailyDose) {
      result.extension?.push({
        url: FHIRExtensionUrl.targetDailyDose,
        valueMedicationRequest: {
          medicationReference: {
            reference: `medications/${rxcui}/drugs/${targetDailyDose.drug}`,
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
        },
      })
    }
    return result
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
    return {
      id: rxcui,
      code: {
        coding: [
          {
            system: CodingSystem.rxNorm,
            code: rxcui,
            display: rxTermInfo?.displayName ?? rxTermInfo?.fullName,
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
              display: ingredient.name,
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
    }
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
