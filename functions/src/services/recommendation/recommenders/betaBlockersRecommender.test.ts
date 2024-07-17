//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import { describe, it } from 'mocha'
import { BetaBlockerRecommender } from './betaBlockersRecommender.js'
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

describe('BetaBlockersRecommender', () => {
  let medicationContraindication: (
    reference: MedicationReference,
  ) => ContraindicationCategory
  let medicationClassContraindication: (
    reference: MedicationClassReference,
  ) => ContraindicationCategory

  const recommender = new BetaBlockerRecommender(
    new MockContraindicationService(
      (_, reference) => medicationContraindication(reference),
      (_, reference) => medicationClassContraindication(reference),
    ),
    new FhirService(),
  )

  beforeEach(() => {
    medicationContraindication = (_) => ContraindicationCategory.none
    medicationClassContraindication = (_) => ContraindicationCategory.none
  })

  const contextBelowTarget: MedicationRequestContext = {
    request: {
      medicationReference: {
        reference: DrugReference.bisoprolol5,
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
            code: DrugReference.bisoprolol5.split('/').at(-1),
            display: 'Bisoprolol 5 MG Oral Tablet',
          },
        ],
      },
    },
    drugReference: {
      reference: DrugReference.bisoprolol5,
    },
    medication: {
      code: {
        coding: [
          {
            system: CodingSystem.rxNorm,
            code: MedicationReference.bisoprolol.split('/').at(-1),
            display: 'Bisoprolol',
          },
        ],
      },
      extension: [
        {
          url: FHIRExtensionUrl.minimumDailyDose,
          valueQuantity: {
            ...QuantityUnit.mg,
            value: 5,
          },
        },
        {
          url: FHIRExtensionUrl.targetDailyDose,
          valueQuantity: {
            ...QuantityUnit.mg,
            value: 10,
          },
        },
      ],
    },
    medicationReference: {
      reference: MedicationReference.losartan,
    },
    medicationClass: {
      name: 'Beta Blockers',
      videoPath: 'videoSections/0/videos/1',
    },
    medicationClassReference: {
      reference: MedicationClassReference.betaBlockers,
    },
  }

  const contextAtTarget = structuredClone(contextBelowTarget)
  contextAtTarget.request.dosageInstruction
    ?.at(0)
    ?.timing?.repeat?.timeOfDay?.push('20:00')

  it('should state that it is at target dose', () => {
    const healthSummaryData = mockHealthSummaryData()
    const input: RecommendationInput = {
      requests: [contextAtTarget],
      contraindications: [],
      symptomScores: healthSummaryData.symptomScores.at(-1),
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

  it('should request more blood pressure observations', () => {
    const healthSummaryData = mockHealthSummaryData()
    healthSummaryData.vitals.systolicBloodPressure =
      healthSummaryData.vitals.systolicBloodPressure.slice(0, 2)
    const input: RecommendationInput = {
      requests: [contextBelowTarget],
      contraindications: [],
      symptomScores: healthSummaryData.symptomScores.at(-1),
      vitals: healthSummaryData.vitals,
    }
    const result = recommender.compute(input)
    expect(result).to.have.length(1)
    expect(result.at(0)).to.deep.equal({
      currentMedication: contextAtTarget.requestReference,
      recommendedMedication: undefined,
      category:
        MedicationRecommendationCategory.morePatientObservationsRequired,
    })
  })

  it('should request better heart rate observations', () => {
    const healthSummaryData = mockHealthSummaryData()
    healthSummaryData.vitals.heartRate.forEach((observation) => {
      observation.value = 59
    })
    const input: RecommendationInput = {
      requests: [contextBelowTarget],
      contraindications: [],
      symptomScores: healthSummaryData.symptomScores.at(-1),
      vitals: healthSummaryData.vitals,
    }
    const result = recommender.compute(input)
    expect(result).to.have.length(1)
    expect(result.at(0)).to.deep.equal({
      currentMedication: contextAtTarget.requestReference,
      recommendedMedication: undefined,
      category: MedicationRecommendationCategory.noActionRequired,
    })
  })

  it('should request better heart rate observations', () => {
    const healthSummaryData = mockHealthSummaryData()
    healthSummaryData.vitals.systolicBloodPressure.forEach((observation) => {
      observation.value = 99
    })
    const input: RecommendationInput = {
      requests: [contextBelowTarget],
      contraindications: [],
      symptomScores: healthSummaryData.symptomScores.at(-1),
      vitals: healthSummaryData.vitals,
    }
    const result = recommender.compute(input)
    expect(result).to.have.length(1)
    expect(result.at(0)).to.deep.equal({
      currentMedication: contextAtTarget.requestReference,
      recommendedMedication: undefined,
      category: MedicationRecommendationCategory.noActionRequired,
    })
  })

  it('should request more heart rate observations', () => {
    const healthSummaryData = mockHealthSummaryData()
    healthSummaryData.vitals.heartRate =
      healthSummaryData.vitals.heartRate.slice(0, 2)
    const input: RecommendationInput = {
      requests: [contextBelowTarget],
      contraindications: [],
      symptomScores: healthSummaryData.symptomScores.at(-1),
      vitals: healthSummaryData.vitals,
    }
    const result = recommender.compute(input)
    expect(result).to.have.length(1)
    expect(result.at(0)).to.deep.equal({
      currentMedication: contextAtTarget.requestReference,
      recommendedMedication: undefined,
      category:
        MedicationRecommendationCategory.morePatientObservationsRequired,
    })
  })

  it('should not recommend starting a medication when allergy exists', () => {
    medicationContraindication = (_) =>
      ContraindicationCategory.allergyIntolerance
    medicationClassContraindication = (_) =>
      ContraindicationCategory.allergyIntolerance

    const healthSummaryData = mockHealthSummaryData()
    const input: RecommendationInput = {
      requests: [],
      contraindications: [],
      symptomScores: healthSummaryData.symptomScores.at(-1),
      vitals: healthSummaryData.vitals,
    }
    const result = recommender.compute(input)
    expect(result).to.be.empty
  })

  it('should show carvedilol if only clinician-listed contraindication exists', () => {
    medicationContraindication = (_) => ContraindicationCategory.clinicianListed
    medicationClassContraindication = (_) =>
      ContraindicationCategory.clinicianListed

    const healthSummaryData = mockHealthSummaryData()
    const input: RecommendationInput = {
      requests: [],
      contraindications: [],
      symptomScores: healthSummaryData.symptomScores.at(-1),
      vitals: healthSummaryData.vitals,
    }
    const result = recommender.compute(input)
    expect(result).to.have.length(1)
    expect(result.at(0)).to.deep.equal({
      currentMedication: undefined,
      recommendedMedication: {
        reference: MedicationReference.carvedilol,
      },
      category: MedicationRecommendationCategory.noActionRequired,
    })
  })

  it('should request more patient observations when only 2 heart rate observations exist', () => {
    const healthSummaryData = mockHealthSummaryData()
    healthSummaryData.vitals.heartRate =
      healthSummaryData.vitals.heartRate.slice(0, 2)
    const input: RecommendationInput = {
      requests: [],
      contraindications: [],
      symptomScores: healthSummaryData.symptomScores.at(-1),
      vitals: healthSummaryData.vitals,
    }
    const result = recommender.compute(input)
    expect(result).to.have.length(1)
    expect(result.at(0)).to.deep.equal({
      currentMedication: undefined,
      recommendedMedication: {
        reference: MedicationReference.carvedilol,
      },
      category:
        MedicationRecommendationCategory.morePatientObservationsRequired,
    })
  })

  it('should request more patient observations when only 2 blood pressure observations exist', () => {
    const healthSummaryData = mockHealthSummaryData()
    healthSummaryData.vitals.systolicBloodPressure =
      healthSummaryData.vitals.systolicBloodPressure.slice(0, 2)
    const input: RecommendationInput = {
      requests: [],
      contraindications: [],
      symptomScores: healthSummaryData.symptomScores.at(-1),
      vitals: healthSummaryData.vitals,
    }
    const result = recommender.compute(input)
    expect(result).to.have.length(1)
    expect(result.at(0)).to.deep.equal({
      currentMedication: undefined,
      recommendedMedication: {
        reference: MedicationReference.carvedilol,
      },
      category:
        MedicationRecommendationCategory.morePatientObservationsRequired,
    })
  })

  it('should show carvedilol when the blood pressure observations are too bad', () => {
    const healthSummaryData = mockHealthSummaryData()
    healthSummaryData.vitals.systolicBloodPressure =
      healthSummaryData.vitals.systolicBloodPressure.map((observation) => ({
        ...observation,
        value: 99,
      }))
    const input: RecommendationInput = {
      requests: [],
      contraindications: [],
      symptomScores: healthSummaryData.symptomScores.at(-1),
      vitals: healthSummaryData.vitals,
    }
    const result = recommender.compute(input)
    expect(result).to.have.length(1)
    expect(result.at(0)).to.deep.equal({
      currentMedication: undefined,
      recommendedMedication: {
        reference: MedicationReference.carvedilol,
      },
      category: MedicationRecommendationCategory.noActionRequired,
    })
  })

  it('should show carvedilol when the heart rate observations are too bad', () => {
    const healthSummaryData = mockHealthSummaryData()
    healthSummaryData.vitals.heartRate = healthSummaryData.vitals.heartRate.map(
      (observation) => ({
        ...observation,
        value: 59,
      }),
    )
    const input: RecommendationInput = {
      requests: [],
      contraindications: [],
      symptomScores: healthSummaryData.symptomScores.at(-1),
      vitals: healthSummaryData.vitals,
    }
    const result = recommender.compute(input)
    expect(result).to.have.length(1)
    expect(result.at(0)).to.deep.equal({
      currentMedication: undefined,
      recommendedMedication: {
        reference: MedicationReference.carvedilol,
      },
      category: MedicationRecommendationCategory.noActionRequired,
    })
  })

  it('should recommend starting carvedilol', () => {
    const healthSummaryData = mockHealthSummaryData()
    const input: RecommendationInput = {
      requests: [],
      contraindications: [],
      symptomScores: healthSummaryData.symptomScores.at(-1),
      vitals: healthSummaryData.vitals,
    }
    const result = recommender.compute(input)
    expect(result).to.have.length(1)
    expect(result.at(0)).to.deep.equal({
      currentMedication: undefined,
      recommendedMedication: {
        reference: MedicationReference.carvedilol,
      },
      category: MedicationRecommendationCategory.notStarted,
    })
  })
})
