//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import { describe, it } from 'mocha'
import { MraRecommender } from './mraRecommender.js'
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
import { type RecommendationInput } from '../recommendationService.js'

describe('MraRecommender', () => {
  let medicationContraindication: (
    reference: MedicationReference,
  ) => ContraindicationCategory
  let medicationClassContraindication: (
    reference: MedicationClassReference,
  ) => ContraindicationCategory

  const recommender = new MraRecommender(
    new MockContraindicationService(
      (_, reference) => medicationContraindication(reference),
      (_, reference) => medicationClassContraindication(reference),
    ),
    new FhirService(),
  )
  let healthSummaryData: HealthSummaryData

  beforeEach(async () => {
    healthSummaryData = await mockHealthSummaryData(new Date())
    medicationContraindication = (_) => ContraindicationCategory.none
    medicationClassContraindication = (_) => ContraindicationCategory.none
  })

  describe('No treatment', () => {
    it("doesn't recommend MRA if allergy exists", () => {
      medicationContraindication = (_) =>
        ContraindicationCategory.severeAllergyIntolerance
      medicationClassContraindication = (_) =>
        ContraindicationCategory.severeAllergyIntolerance

      const input: RecommendationInput = {
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(0)
    })

    it('shows spironolactone when physician-listed contraindication exists', () => {
      medicationContraindication = (_) =>
        ContraindicationCategory.clinicianListed
      medicationClassContraindication = (_) =>
        ContraindicationCategory.clinicianListed

      const input: RecommendationInput = {
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: undefined,
        recommendedMedication: {
          reference: MedicationReference.spironolactone,
        },
        category: MedicationRecommendationCategory.noActionRequired,
      })
    })

    it('shows spironolactone when creatinine value is too bad', () => {
      healthSummaryData.vitals.creatinine = {
        date: new Date(),
        value: 3,
        unit: QuantityUnit.mg_dL,
      }
      const input: RecommendationInput = {
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: undefined,
        recommendedMedication: {
          reference: MedicationReference.spironolactone,
        },
        category: MedicationRecommendationCategory.noActionRequired,
      })
    })

    it('shows spironolactone if potassium value is too bad', () => {
      healthSummaryData.vitals.potassium = {
        date: new Date(),
        value: 6,
        unit: QuantityUnit.mEq_L,
      }
      const input: RecommendationInput = {
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: undefined,
        recommendedMedication: {
          reference: MedicationReference.spironolactone,
        },
        category: MedicationRecommendationCategory.noActionRequired,
      })
    })

    it('recommends spironolactone correctly', () => {
      const input: RecommendationInput = {
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: undefined,
        recommendedMedication: {
          reference: MedicationReference.spironolactone,
        },
        category: MedicationRecommendationCategory.notStarted,
      })
    })
  })

  describe('Existing treatment: Eplerenone', () => {
    const contextBelowTarget: MedicationRequestContext = {
      request: {
        medicationReference: {
          reference: DrugReference.eplerenone25,
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
                  value: 1,
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
              code: DrugReference.eplerenone25.split('/').at(-1),
              display: 'Eplerenone 25 MG Oral Tablet',
            },
          ],
        },
        ingredient: [
          {
            itemCodeableConcept: {
              coding: [
                {
                  system: CodingSystem.rxNorm,
                  code: MedicationReference.eplerenone.split('/').at(-1),
                  display: 'Eplerenone',
                },
              ],
            },
            strength: {
              numerator: {
                ...QuantityUnit.mg,
                value: 25,
              },
            },
          },
        ],
      },
      drugReference: {
        reference: DrugReference.eplerenone25,
      },
      medication: {
        code: {
          coding: [
            {
              system: CodingSystem.rxNorm,
              code: MedicationReference.eplerenone.split('/').at(-1),
              display: 'Eplerenone',
            },
          ],
        },
        extension: [
          {
            url: FHIRExtensionUrl.minimumDailyDose,
            valueQuantity: {
              ...QuantityUnit.mg,
              value: 12.5,
            },
          },
          {
            url: FHIRExtensionUrl.targetDailyDose,
            valueQuantity: {
              ...QuantityUnit.mg,
              value: 50,
            },
          },
        ],
      },
      medicationReference: {
        reference: MedicationReference.eplerenone,
      },
      medicationClass: {
        name: 'MRA',
        videoPath: 'videoSections/1/videos/3',
      },
      medicationClassReference: {
        reference:
          MedicationClassReference.mineralocorticoidReceptorAntagonists,
      },
    }

    const contextAtTarget = structuredClone(contextBelowTarget)
    contextAtTarget.request.dosageInstruction
      ?.at(0)
      ?.timing?.repeat?.timeOfDay?.push('20:00')

    it('states that target dose is reached', () => {
      const input: RecommendationInput = {
        requests: [contextAtTarget],
        contraindications: [],
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: contextAtTarget.requestReference,
        recommendedMedication: undefined,
        category: MedicationRecommendationCategory.targetDoseReached,
      })
    })

    it('requests newer lab values when date is too old for potassium', () => {
      healthSummaryData.vitals.potassium = {
        unit: QuantityUnit.mEq_L,
        value: 4,
        date: new Date('2021-01-01'),
      }
      const input: RecommendationInput = {
        requests: [contextBelowTarget],
        contraindications: [],
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: contextAtTarget.requestReference,
        recommendedMedication: undefined,
        category: MedicationRecommendationCategory.moreLabObservationsRequired,
      })
    })

    it('requests newer lab values when date is too old for creatinine', () => {
      healthSummaryData.vitals.creatinine = {
        unit: QuantityUnit.mg_dL,
        value: 2,
        date: new Date('2021-01-01'),
      }
      const input: RecommendationInput = {
        requests: [contextBelowTarget],
        contraindications: [],
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: contextAtTarget.requestReference,
        recommendedMedication: undefined,
        category: MedicationRecommendationCategory.moreLabObservationsRequired,
      })
    })

    it('detects personal target when creatinine is too high', () => {
      healthSummaryData.vitals.creatinine = {
        unit: QuantityUnit.mg_dL,
        value: 3,
        date: new Date(),
      }
      const input: RecommendationInput = {
        requests: [contextBelowTarget],
        contraindications: [],
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: contextAtTarget.requestReference,
        recommendedMedication: undefined,
        category: MedicationRecommendationCategory.personalTargetDoseReached,
      })
    })

    it('detects personal target when potassium is too high', () => {
      healthSummaryData.vitals.potassium = {
        unit: QuantityUnit.mEq_L,
        value: 6,
        date: new Date(),
      }
      const input: RecommendationInput = {
        requests: [contextBelowTarget],
        contraindications: [],
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: contextAtTarget.requestReference,
        recommendedMedication: undefined,
        category: MedicationRecommendationCategory.personalTargetDoseReached,
      })
    })

    it('recommends increase', () => {
      const input: RecommendationInput = {
        requests: [contextBelowTarget],
        contraindications: [],
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: contextAtTarget.requestReference,
        recommendedMedication: undefined,
        category: MedicationRecommendationCategory.improvementAvailable,
      })
    })
  })
})
