//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import { describe, it } from 'mocha'
import { Sglt2iRecommender } from './sglt2iRecommender.js'
import { FHIRMedicationRequest } from '../../../models/fhir/baseTypes/fhirElement.js'
import { type HealthSummaryData } from '../../../models/healthSummaryData.js'
import { type MedicationRequestContext } from '../../../models/medicationRequestContext.js'
import { UserMedicationRecommendationType } from '../../../models/types/userMedicationRecommendation.js'
import { MockContraindicationService } from '../../../tests/mocks/contraindicationService.js'
import { mockHealthSummaryData } from '../../../tests/mocks/healthSummaryData.js'
import { cleanupMocks, setupMockFirebase } from '../../../tests/setup.js'
import { ContraindicationCategory } from '../../contraindication/contraindicationService.js'
import { getServiceFactory } from '../../factory/getServiceFactory.js'
import { QuantityUnit } from '../../fhir/quantityUnit.js'
import { type MedicationService } from '../../medication/medicationService.js'
import {
  DrugReference,
  type MedicationClassReference,
  MedicationReference,
} from '../../references.js'
import { CachingStrategy } from '../../seeding/seedingService.js'

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
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      })
      expect(result).to.have.length(0)
    })

    it('recommends no treatment when eGFR is too low', () => {
      healthSummaryData.vitals.estimatedGlomerularFiltrationRate = {
        date: new Date(),
        unit: QuantityUnit.mL_min_173m2,
        value: 19,
      }
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      })
      expect(result).to.have.length(0)
    })

    it('shows empagliflozin when clinician-listed contraindications exist', () => {
      medicationContraindication = (_) =>
        ContraindicationCategory.clinicianListed
      medicationClassContraindication = (_) =>
        ContraindicationCategory.clinicianListed

      const result = recommender.compute({
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.empagliflozin,
        type: UserMedicationRecommendationType.noActionRequired,
      })
    })

    it('requests more blood pressure observations', () => {
      healthSummaryData.vitals.systolicBloodPressure =
        healthSummaryData.vitals.systolicBloodPressure.slice(0, 2)
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.empagliflozin,
        type: UserMedicationRecommendationType.morePatientObservationsRequired,
      })
    })

    it('shows empagliflozin when median systolic is too low', () => {
      healthSummaryData.vitals.systolicBloodPressure.forEach((observation) => {
        observation.value = 99
      })
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.empagliflozin,
        type: UserMedicationRecommendationType.noActionRequired,
      })
    })

    it('recommends empagliflozin', () => {
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.empagliflozin,
        type: UserMedicationRecommendationType.notStarted,
      })
    })
  })

  describe('On Sotagliflozin', () => {
    let contextBelowTarget: MedicationRequestContext
    before(async () => {
      const request = FHIRMedicationRequest.create({
        drugReference: DrugReference.sotagliflozin200,
        frequencyPerDay: 1,
        quantity: 1,
      })
      contextBelowTarget = await medicationService.getContext(request, {
        reference: 'users/mockUser/medicationRequests/someMedicationRequest',
      })
    })

    it('detects target dose', async () => {
      const request = FHIRMedicationRequest.create({
        drugReference: DrugReference.sotagliflozin200,
        frequencyPerDay: 2,
        quantity: 1,
      })
      const contextAtTarget = await medicationService.getContext(request, {
        reference: 'users/mockUser/medicationRequests/someMedicationRequest',
      })
      const result = recommender.compute({
        requests: [contextAtTarget],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextAtTarget],
        recommendedMedication: undefined,
        type: UserMedicationRecommendationType.targetDoseReached,
      })
    })

    it('requests more blood pressure observations', () => {
      healthSummaryData.vitals.systolicBloodPressure =
        healthSummaryData.vitals.systolicBloodPressure.slice(0, 2)
      const result = recommender.compute({
        requests: [contextBelowTarget],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget],
        recommendedMedication: undefined,
        type: UserMedicationRecommendationType.morePatientObservationsRequired,
      })
    })

    it('detects personal target reached', () => {
      healthSummaryData.vitals.systolicBloodPressure.forEach((observation) => {
        observation.value = 99
      })
      const result = recommender.compute({
        requests: [contextBelowTarget],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget],
        recommendedMedication: undefined,
        type: UserMedicationRecommendationType.personalTargetDoseReached,
      })
    })

    it('recommends increase', () => {
      const result = recommender.compute({
        requests: [contextBelowTarget],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget],
        recommendedMedication: undefined,
        type: UserMedicationRecommendationType.improvementAvailable,
      })
    })
  })
})
