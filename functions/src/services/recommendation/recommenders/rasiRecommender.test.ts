//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { expect } from 'chai'
import { describe, it } from 'mocha'
import { RasiRecommender } from './rasiRecommender.js'
import { type HealthSummaryData } from '../../../models/healthSummaryData.js'
import { MedicationRecommendationCategory } from '../../../models/medicationRecommendation.js'
import { type MedicationRequestContext } from '../../../models/medicationRequestContext.js'
import { MockContraindicationService } from '../../../tests/mocks/contraindicationService.js'
import { mockHealthSummaryData } from '../../../tests/mocks/healthSummaryData.js'
import {
  CodingSystem,
  DrugReference,
  FHIRExtensionUrl,
  MedicationClassReference,
  MedicationReference,
} from '../../codes.js'
import { ContraindicationCategory } from '../../contraindication/contraindicationService.js'
import { FhirService } from '../../fhir/fhirService.js'
import { QuantityUnit } from '../../fhir/quantityUnit.js'

describe('RasiRecommender', () => {
  let medicationContraindication: (
    reference: MedicationReference,
  ) => ContraindicationCategory
  let medicationClassContraindication: (
    reference: MedicationClassReference,
  ) => ContraindicationCategory

  const recommender = new RasiRecommender(
    new MockContraindicationService(
      (_, reference) => medicationContraindication(reference),
      (_, reference) => medicationClassContraindication(reference),
    ),
    new FhirService(),
  )
  let healthSummaryData: HealthSummaryData

  beforeEach(async () => {
    healthSummaryData = await mockHealthSummaryData(new Date())
    healthSummaryData.symptomScores.forEach((score) => {
      score.dizzinessScore = 0
    })
    medicationContraindication = (_) => ContraindicationCategory.none
    medicationClassContraindication = (_) => ContraindicationCategory.none
  })

  describe('No treatment', () => {
    it('does not recommend medication when ARB allergies are present', () => {
      medicationContraindication = (_) => ContraindicationCategory.none
      medicationClassContraindication = (medicationClass) =>
        (
          medicationClass ===
          MedicationClassReference.angiotensinReceptorBlockers
        ) ?
          ContraindicationCategory.allergyIntolerance
        : ContraindicationCategory.none

      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(0)
    })

    it('does not recommend medication when severe ACEI allergies are present', () => {
      medicationContraindication = (_) => ContraindicationCategory.none
      medicationClassContraindication = (medicationClass) =>
        (
          medicationClass ===
          MedicationClassReference.angiotensinConvertingEnzymeInhibitors
        ) ?
          ContraindicationCategory.severeAllergyIntolerance
        : ContraindicationCategory.none

      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(0)
    })

    it('shows losartan when clinician-listed contraindications are present', () => {
      medicationContraindication = (_) =>
        ContraindicationCategory.clinicianListed
      medicationClassContraindication = (_) =>
        ContraindicationCategory.clinicianListed

      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: {
          reference: MedicationReference.losartan,
        },
        category: MedicationRecommendationCategory.noActionRequired,
      })
    })

    it('requests more blood pressure observations', () => {
      healthSummaryData.vitals.systolicBloodPressure =
        healthSummaryData.vitals.systolicBloodPressure.slice(0, 2)
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: {
          reference: MedicationReference.losartan,
        },
        category:
          MedicationRecommendationCategory.morePatientObservationsRequired,
      })
    })

    it('shows losartan when median systolic is below 100', () => {
      healthSummaryData.vitals.systolicBloodPressure.forEach((observation) => {
        observation.value = 99
      })
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: {
          reference: MedicationReference.losartan,
        },
        category: MedicationRecommendationCategory.noActionRequired,
      })
    })

    it('shows losartan when creatinine is too high', () => {
      healthSummaryData.vitals.creatinine = {
        date: new Date(),
        value: 2.5,
        unit: QuantityUnit.mg_dL,
      }
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: {
          reference: MedicationReference.losartan,
        },
        category: MedicationRecommendationCategory.noActionRequired,
      })
    })

    it('shows losartan when potassium is too high', () => {
      healthSummaryData.vitals.potassium = {
        date: new Date(),
        value: 6,
        unit: QuantityUnit.mEq_L,
      }
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: {
          reference: MedicationReference.losartan,
        },
        category: MedicationRecommendationCategory.noActionRequired,
      })
    })

    it('shows losartan when contraindication to ARNI exists', () => {
      medicationClassContraindication = (medicationClass) =>
        (
          medicationClass ===
          MedicationClassReference.angiotensinReceptorNeprilysinInhibitors
        ) ?
          ContraindicationCategory.clinicianListed
        : ContraindicationCategory.none
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: {
          reference: MedicationReference.losartan,
        },
        category: MedicationRecommendationCategory.notStarted,
      })
    })

    it('shows sacubitril-valsartan', () => {
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: {
          reference: MedicationReference.sacubitrilValsartan,
        },
        category: MedicationRecommendationCategory.notStarted,
      })
    })
  })

  describe('On perindopril (ACEI/ARB)', () => {
    const contextBelowTarget: MedicationRequestContext = {
      request: {
        medicationReference: {
          reference: DrugReference.perindopril4,
        },
        dosageInstruction: [
          {
            timing: {
              repeat: {
                timeOfDay: ['08:00'],
              },
            },
            doseAndRate: [
              {
                doseQuantity: {
                  value: 2,
                  unit: 'tablet',
                },
              },
            ],
          },
        ],
      },
      requestReference: {
        reference: '/users/mockUser/medicationRequests/mockMedicationRequest',
      },
      drug: {
        code: {
          coding: [
            {
              system: CodingSystem.rxNorm,
              code: DrugReference.perindopril4.split('/').at(-1),
              display: 'Perindopril 25 MG Oral Tablet',
            },
          ],
        },
        ingredient: [
          {
            itemCodeableConcept: {
              coding: [
                {
                  system: CodingSystem.rxNorm,
                  code: MedicationReference.perindopril.split('/').at(-1),
                  display: 'Perindopril',
                },
              ],
            },
            strength: {
              numerator: {
                ...QuantityUnit.mg,
                value: 4,
              },
            },
          },
        ],
      },
      drugReference: {
        reference: DrugReference.perindopril4,
      },
      medication: {
        code: {
          coding: [
            {
              system: CodingSystem.rxNorm,
              code: MedicationReference.perindopril.split('/').at(-1),
              display: 'Perindopril',
            },
          ],
        },
        extension: [
          {
            url: FHIRExtensionUrl.minimumDailyDose,
            valueIngredient: [
              {
                itemCodeableConcept: {
                  coding: [
                    {
                      system: CodingSystem.rxNorm,
                      code: MedicationReference.perindopril.split('/').at(-1),
                      display: 'Perindopril',
                    },
                  ],
                },
                strength: {
                  numerator: {
                    ...QuantityUnit.mg,
                    value: 2,
                  },
                },
              },
            ],
          },
          {
            url: FHIRExtensionUrl.targetDailyDose,
            valueIngredient: [
              {
                itemCodeableConcept: {
                  coding: [
                    {
                      system: CodingSystem.rxNorm,
                      code: MedicationReference.perindopril.split('/').at(-1),
                      display: 'Perindopril',
                    },
                  ],
                },
                strength: {
                  numerator: {
                    ...QuantityUnit.mg,
                    value: 16,
                  },
                },
              },
            ],
          },
        ],
      },
      medicationReference: {
        reference: MedicationReference.perindopril,
      },
      medicationClass: {
        name: 'ARBs',
        videoPath: 'videoSections/1/videos/2',
      },
      medicationClassReference: {
        reference: MedicationClassReference.angiotensinReceptorBlockers,
      },
    }

    describe('Contraindication to ARNI', () => {
      beforeEach(() => {
        medicationClassContraindication = (medicationClass) =>
          (
            medicationClass ==
            MedicationClassReference.angiotensinReceptorNeprilysinInhibitors
          ) ?
            ContraindicationCategory.clinicianListed
          : ContraindicationCategory.none
      })

      it('detects target dose reached', () => {
        const contextAtTarget = structuredClone(contextBelowTarget)
        contextAtTarget.request.dosageInstruction
          ?.at(0)
          ?.timing?.repeat?.timeOfDay?.push('20:00')
        const result = recommender.compute({
          requests: [contextAtTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          symptomScores: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget.requestReference],
          recommendedMedication: undefined,
          category: MedicationRecommendationCategory.targetDoseReached,
        })
      })

      it('requests more blood pressure observations', () => {
        healthSummaryData.vitals.systolicBloodPressure =
          healthSummaryData.vitals.systolicBloodPressure.slice(0, 2)
        const result = recommender.compute({
          requests: [contextBelowTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          symptomScores: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget.requestReference],
          recommendedMedication: undefined,
          category:
            MedicationRecommendationCategory.morePatientObservationsRequired,
        })
      })

      it('detects personal target reached with low median systolic', () => {
        healthSummaryData.vitals.systolicBloodPressure.forEach(
          (observation) => {
            observation.value = 99
          },
        )
        const result = recommender.compute({
          requests: [contextBelowTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          symptomScores: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget.requestReference],
          recommendedMedication: undefined,
          category: MedicationRecommendationCategory.personalTargetDoseReached,
        })
      })

      it('detects personal target reached with creatinine too high', () => {
        healthSummaryData.vitals.creatinine = {
          date: new Date(),
          value: 3,
          unit: QuantityUnit.mg_dL,
        }
        const result = recommender.compute({
          requests: [contextBelowTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          symptomScores: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget.requestReference],
          recommendedMedication: undefined,
          category: MedicationRecommendationCategory.personalTargetDoseReached,
        })
      })

      it('detects personal target reached with potassium too high', () => {
        healthSummaryData.vitals.potassium = {
          date: new Date(),
          value: 6,
          unit: QuantityUnit.mEq_L,
        }
        const result = recommender.compute({
          requests: [contextBelowTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          symptomScores: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget.requestReference],
          recommendedMedication: undefined,
          category: MedicationRecommendationCategory.personalTargetDoseReached,
        })
      })

      it('detects personal target reached with dizziness score too high', () => {
        healthSummaryData.symptomScores.forEach((score) => {
          score.dizzinessScore = 3
        })
        const result = recommender.compute({
          requests: [contextBelowTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          symptomScores: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget.requestReference],
          recommendedMedication: undefined,
          category: MedicationRecommendationCategory.personalTargetDoseReached,
        })
      })

      it('recommends increase', () => {
        const result = recommender.compute({
          requests: [contextBelowTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          symptomScores: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget.requestReference],
          recommendedMedication: undefined,
          category: MedicationRecommendationCategory.improvementAvailable,
        })
      })
    })

    describe('No contraindication to ARNI', () => {
      it('requests more blood pressure observations', () => {
        healthSummaryData.vitals.systolicBloodPressure =
          healthSummaryData.vitals.systolicBloodPressure.slice(0, 2)
        const result = recommender.compute({
          requests: [contextBelowTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          symptomScores: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget.requestReference],
          recommendedMedication: undefined,
          category:
            MedicationRecommendationCategory.morePatientObservationsRequired,
        })
      })

      it('detects personal target reached with low median systolic', () => {
        healthSummaryData.vitals.systolicBloodPressure.forEach(
          (observation) => {
            observation.value = 99
          },
        )
        const result = recommender.compute({
          requests: [contextBelowTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          symptomScores: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget.requestReference],
          recommendedMedication: undefined,
          category: MedicationRecommendationCategory.personalTargetDoseReached,
        })
      })

      it('detects personal target reached with creatinine too high', () => {
        healthSummaryData.vitals.creatinine = {
          date: new Date(),
          value: 3,
          unit: QuantityUnit.mg_dL,
        }
        const result = recommender.compute({
          requests: [contextBelowTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          symptomScores: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget.requestReference],
          recommendedMedication: undefined,
          category: MedicationRecommendationCategory.personalTargetDoseReached,
        })
      })

      it('detects personal target reached with potassium too high', () => {
        healthSummaryData.vitals.potassium = {
          date: new Date(),
          value: 6,
          unit: QuantityUnit.mEq_L,
        }
        const result = recommender.compute({
          requests: [contextBelowTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          symptomScores: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget.requestReference],
          recommendedMedication: undefined,
          category: MedicationRecommendationCategory.personalTargetDoseReached,
        })
      })

      it('detects personal target reached with dizziness score too high', () => {
        healthSummaryData.symptomScores.forEach((score) => {
          score.dizzinessScore = 3
        })
        const result = recommender.compute({
          requests: [contextBelowTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          symptomScores: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget.requestReference],
          recommendedMedication: undefined,
          category: MedicationRecommendationCategory.personalTargetDoseReached,
        })
      })

      it('recommends change to ARNI', () => {
        const result = recommender.compute({
          requests: [contextBelowTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          symptomScores: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget.requestReference],
          recommendedMedication: {
            reference: MedicationReference.sacubitrilValsartan,
          },
          category: MedicationRecommendationCategory.improvementAvailable,
        })
      })
    })
  })

  describe('On sacubitril/valsartan', () => {
    const contextBelowTarget: MedicationRequestContext = {
      request: {
        medicationReference: {
          reference: DrugReference.sacubitrilValsartan49_51,
        },
        dosageInstruction: [
          {
            timing: {
              repeat: {
                timeOfDay: ['08:00'],
              },
            },
            doseAndRate: [
              {
                doseQuantity: {
                  value: 2.5,
                  unit: 'tablet',
                },
              },
            ],
          },
        ],
      },
      requestReference: {
        reference: '/users/mockUser/medicationRequests/mockMedicationRequest',
      },
      drug: {
        code: {
          coding: [
            {
              system: CodingSystem.rxNorm,
              code: DrugReference.sacubitrilValsartan49_51.split('/').at(-1),
              display: 'sacubitril 49 MG / valsartan 51 MG Oral Tablet',
            },
          ],
        },
        ingredient: [
          {
            itemCodeableConcept: {
              coding: [
                {
                  system: CodingSystem.rxNorm,
                  code: '1656328',
                  display: 'sacubitril',
                },
              ],
            },
            strength: {
              numerator: {
                ...QuantityUnit.mg,
                value: 49,
              },
            },
          },
          {
            itemCodeableConcept: {
              coding: [
                {
                  system: CodingSystem.rxNorm,
                  code: '69749',
                  display: 'valsartan',
                },
              ],
            },
            strength: {
              numerator: {
                ...QuantityUnit.mg,
                value: 51,
              },
            },
          },
        ],
      },
      drugReference: {
        reference: DrugReference.sacubitrilValsartan49_51,
      },
      medication: {
        code: {
          coding: [
            {
              system: CodingSystem.rxNorm,
              code: MedicationReference.sacubitrilValsartan.split('/').at(-1),
              display: 'Sacubitril/Valsartan',
            },
          ],
        },
        extension: [
          {
            url: FHIRExtensionUrl.minimumDailyDose,

            valueIngredient: [
              {
                itemCodeableConcept: {
                  coding: [
                    {
                      system: CodingSystem.rxNorm,
                      code: '1656328',
                      display: 'sacubitril',
                    },
                  ],
                },
                strength: {
                  numerator: {
                    ...QuantityUnit.mg,
                    value: 48,
                  },
                },
              },
              {
                itemCodeableConcept: {
                  coding: [
                    {
                      system: CodingSystem.rxNorm,
                      code: '69749',
                      display: 'valsartan',
                    },
                  ],
                },
                strength: {
                  numerator: {
                    ...QuantityUnit.mg,
                    value: 52,
                  },
                },
              },
            ],
          },
          {
            url: FHIRExtensionUrl.targetDailyDose,
            valueIngredient: [
              {
                itemCodeableConcept: {
                  coding: [
                    {
                      system: CodingSystem.rxNorm,
                      code: '1656328',
                      display: 'sacubitril',
                    },
                  ],
                },
                strength: {
                  numerator: {
                    ...QuantityUnit.mg,
                    value: 194,
                  },
                },
              },
              {
                itemCodeableConcept: {
                  coding: [
                    {
                      system: CodingSystem.rxNorm,
                      code: '69749',
                      display: 'valsartan',
                    },
                  ],
                },
                strength: {
                  numerator: {
                    ...QuantityUnit.mg,
                    value: 206,
                  },
                },
              },
            ],
          },
        ],
      },
      medicationReference: {
        reference: MedicationReference.perindopril,
      },
      medicationClass: {
        name: 'ARNI',
        videoPath: 'videoSections/1/videos/4',
      },
      medicationClassReference: {
        reference:
          MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
      },
    }

    it('detects target dose reached', () => {
      // TODO: What should happen if target dose for one ingredient is reached but not another?
      const contextAtTarget = structuredClone(contextBelowTarget)
      contextAtTarget.request.dosageInstruction
        ?.at(0)
        ?.timing?.repeat?.timeOfDay?.push('20:00')
      const result = recommender.compute({
        requests: [contextAtTarget],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget.requestReference],
        recommendedMedication: undefined,
        category: MedicationRecommendationCategory.targetDoseReached,
      })
    })

    it('requests more blood pressure observations', () => {
      healthSummaryData.vitals.systolicBloodPressure =
        healthSummaryData.vitals.systolicBloodPressure.slice(0, 2)
      const result = recommender.compute({
        requests: [contextBelowTarget],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget.requestReference],
        recommendedMedication: undefined,
        category:
          MedicationRecommendationCategory.morePatientObservationsRequired,
      })
    })

    it('detects personal target dose when median systolic is low', () => {
      healthSummaryData.vitals.systolicBloodPressure.forEach((observation) => {
        observation.value = 99
      })
      const result = recommender.compute({
        requests: [contextBelowTarget],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget.requestReference],
        recommendedMedication: undefined,
        category: MedicationRecommendationCategory.personalTargetDoseReached,
      })
    })

    it('detects personal target dose when creatinine is too high', () => {
      healthSummaryData.vitals.creatinine = {
        date: new Date(),
        value: 3,
        unit: QuantityUnit.mg_dL,
      }
      const result = recommender.compute({
        requests: [contextBelowTarget],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget.requestReference],
        recommendedMedication: undefined,
        category: MedicationRecommendationCategory.personalTargetDoseReached,
      })
    })

    it('detects personal target dose when potassium is too high', () => {
      healthSummaryData.vitals.potassium = {
        date: new Date(),
        value: 6,
        unit: QuantityUnit.mEq_L,
      }
      const result = recommender.compute({
        requests: [contextBelowTarget],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget.requestReference],
        recommendedMedication: undefined,
        category: MedicationRecommendationCategory.personalTargetDoseReached,
      })
    })

    it('detects personal target dose when dizziness is too high', () => {
      healthSummaryData.symptomScores.forEach((score) => {
        score.dizzinessScore = 3
      })
      const result = recommender.compute({
        requests: [contextBelowTarget],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget.requestReference],
        recommendedMedication: undefined,
        category: MedicationRecommendationCategory.personalTargetDoseReached,
      })
    })

    it('recommends increase', () => {
      const result = recommender.compute({
        requests: [contextBelowTarget],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget.requestReference],
        recommendedMedication: undefined,
        category: MedicationRecommendationCategory.improvementAvailable,
      })
    })
  })
})
