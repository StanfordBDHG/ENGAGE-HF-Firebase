//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import { describe, it } from 'mocha'
import { type RecommendationInput } from './recommender.js'
import { Sglt2iRecommender } from './sglt2iRecommender.js'
import { type HealthSummaryData } from '../../../models/healthSummaryData.js'
import { MedicationRecommendationType } from '../../../models/medicationRecommendation.js'
import { type MedicationRequestContext } from '../../../models/medicationRequestContext.js'
import { MockContraindicationService } from '../../../tests/mocks/contraindicationService.js'
import { mockHealthSummaryData } from '../../../tests/mocks/healthSummaryData.js'
import { cleanupMocks, setupMockFirebase } from '../../../tests/setup.js'
import { ContraindicationCategory } from '../../contraindication/contraindicationService.js'
import { getServiceFactory } from '../../factory/getServiceFactory.js'
import { FhirService } from '../../fhir/fhirService.js'
import { QuantityUnit } from '../../fhir/quantityUnit.js'
import { type MedicationService } from '../../medication/medicationService.js'
import {
  DrugReference,
  type MedicationClassReference,
  MedicationReference,
} from '../../references.js'
import { CachingStrategy } from '../../seeding/seedingService.js'
import { UserDataFactory } from '../../seeding/userData/userDataFactory.js'

describe('Sglt2iRecommender', () => {
  let medicationContraindication: (
    reference: MedicationReference,
  ) => ContraindicationCategory
  let medicationClassContraindication: (
    reference: MedicationClassReference,
  ) => ContraindicationCategory

  const recommender = new Sglt2iRecommender(
    new MockContraindicationService(
      (_, reference) => medicationContraindication(reference),
      (_, reference) => medicationClassContraindication(reference),
    ),
    new FhirService(),
  )
  let healthSummaryData: HealthSummaryData
  let medicationService: MedicationService

  before(async () => {
    setupMockFirebase()
    const factory = getServiceFactory()
    const staticDataService = factory.staticData()
    await staticDataService.updateMedicationClasses(CachingStrategy.expectCache)
    await staticDataService.updateMedications(CachingStrategy.expectCache)
    medicationService = factory.medication()
  })

  beforeEach(async () => {
    healthSummaryData = await mockHealthSummaryData(new Date())
    healthSummaryData.vitals.estimatedGlomerularFiltrationRate = {
      date: new Date(),
      unit: QuantityUnit.mL_min_173m2,
      value: 19,
    }
    medicationContraindication = (_) => ContraindicationCategory.none
    medicationClassContraindication = (_) => ContraindicationCategory.none
  })

  after(() => {
    cleanupMocks()
  })

  describe('No treatment', () => {
    it('recommends no treatment when allergies exist', () => {
      medicationContraindication = (_) =>
        ContraindicationCategory.allergyIntolerance
      medicationClassContraindication = (_) =>
        ContraindicationCategory.allergyIntolerance
      const input: RecommendationInput = {
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(0)
    })

    it('recommends no treatment when eGFR is too high', () => {
      healthSummaryData.vitals.estimatedGlomerularFiltrationRate = {
        date: new Date(),
        unit: QuantityUnit.mL_min_173m2,
        value: 21,
      }
      const input: RecommendationInput = {
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(0)
    })

    it('shows empagliflozin when clinician-listed contraindications exist', () => {
      medicationContraindication = (_) =>
        ContraindicationCategory.clinicianListed
      medicationClassContraindication = (_) =>
        ContraindicationCategory.clinicianListed

      const input: RecommendationInput = {
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.empagliflozin,
        type: MedicationRecommendationType.noActionRequired,
      })
    })

    it('requests more blood pressure observations', () => {
      healthSummaryData.vitals.systolicBloodPressure =
        healthSummaryData.vitals.systolicBloodPressure.slice(0, 2)
      const input: RecommendationInput = {
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.empagliflozin,
        type: MedicationRecommendationType.morePatientObservationsRequired,
      })
    })

    it('shows empagliflozin when median systolic is too low', () => {
      healthSummaryData.vitals.systolicBloodPressure.forEach((observation) => {
        observation.value = 99
      })
      const input: RecommendationInput = {
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.empagliflozin,
        type: MedicationRecommendationType.noActionRequired,
      })
    })

    it('recommends empagliflozin', () => {
      const input: RecommendationInput = {
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.empagliflozin,
        type: MedicationRecommendationType.notStarted,
      })
    })
  })

  describe('On Sotagliflozin', () => {
    let contextBelowTarget: MedicationRequestContext
    before(async () => {
      const request = UserDataFactory.medicationRequest({
        drugReference: DrugReference.sotagliflozin200,
        frequencyPerDay: 1,
        quantity: 1,
      })
      contextBelowTarget = await medicationService.getContext(request, {
        reference: 'users/mockUser/medicationRequests/someMedicationRequest',
      })
    })

    it('detects target dose', async () => {
      const request = UserDataFactory.medicationRequest({
        drugReference: DrugReference.sotagliflozin200,
        frequencyPerDay: 2,
        quantity: 1,
      })
      const contextAtTarget = await medicationService.getContext(request, {
        reference: 'users/mockUser/medicationRequests/someMedicationRequest',
      })
      const input: RecommendationInput = {
        requests: [contextAtTarget],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextAtTarget],
        recommendedMedication: undefined,
        type: MedicationRecommendationType.targetDoseReached,
      })
    })

    it('requests more blood pressure observations', () => {
      healthSummaryData.vitals.systolicBloodPressure =
        healthSummaryData.vitals.systolicBloodPressure.slice(0, 2)
      const input: RecommendationInput = {
        requests: [contextBelowTarget],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget],
        recommendedMedication: undefined,
        type: MedicationRecommendationType.morePatientObservationsRequired,
      })
    })

    it('detects personal target reached', () => {
      healthSummaryData.vitals.systolicBloodPressure.forEach((observation) => {
        observation.value = 99
      })
      const input: RecommendationInput = {
        requests: [contextBelowTarget],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget],
        recommendedMedication: undefined,
        type: MedicationRecommendationType.personalTargetDoseReached,
      })
    })

    it('recommends increase', () => {
      const input: RecommendationInput = {
        requests: [contextBelowTarget],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      }
      const result = recommender.compute(input)
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget],
        recommendedMedication: undefined,
        type: MedicationRecommendationType.improvementAvailable,
      })
    })
  })
})
