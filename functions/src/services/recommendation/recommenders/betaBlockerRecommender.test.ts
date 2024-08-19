//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import { describe, it } from 'mocha'
import { BetaBlockerRecommender } from './betaBlockerRecommender.js'
import { FHIRMedicationRequest } from '../../../models/fhir/baseTypes/fhirElement.js'
import { type HealthSummaryData } from '../../../models/healthSummaryData.js'
import { type MedicationRequestContext } from '../../../models/medicationRequestContext.js'
import { SymptomScore } from '../../../models/types/symptomScore.js'
import { UserMedicationRecommendationType } from '../../../models/types/userMedicationRecommendation.js'
import { MockContraindicationService } from '../../../tests/mocks/contraindicationService.js'
import { mockHealthSummaryData } from '../../../tests/mocks/healthSummaryData.js'
import { cleanupMocks, setupMockFirebase } from '../../../tests/setup.js'
import { ContraindicationCategory } from '../../contraindication/contraindicationService.js'
import { getServiceFactory } from '../../factory/getServiceFactory.js'
import { type MedicationService } from '../../medication/medicationService.js'
import {
  DrugReference,
  type MedicationClassReference,
  MedicationReference,
} from '../../references.js'
import { CachingStrategy } from '../../seeding/seedingService.js'

describe('BetaBlockerRecommender', () => {
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
      (_, medicationReferences) => medicationReferences.at(0),
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
    it('does not recommend starting a medication when allergy exists', () => {
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
      expect(result).to.be.empty
    })

    it('shows carvedilol if only clinician-listed contraindication exists', () => {
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
        recommendedMedication: MedicationReference.carvedilol,
        type: UserMedicationRecommendationType.noActionRequired,
      })
    })

    it('requests more patient observations when only 2 heart rate observations exist', () => {
      healthSummaryData.vitals.heartRate =
        healthSummaryData.vitals.heartRate.slice(0, 2)
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.carvedilol,
        type: UserMedicationRecommendationType.morePatientObservationsRequired,
      })
    })

    it('requests more patient observations when only 2 blood pressure observations exist', () => {
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
        recommendedMedication: MedicationReference.carvedilol,
        type: UserMedicationRecommendationType.morePatientObservationsRequired,
      })
    })

    it('shows carvedilol when the blood pressure observations are too bad', () => {
      healthSummaryData.vitals.systolicBloodPressure =
        healthSummaryData.vitals.systolicBloodPressure.map((observation) => ({
          ...observation,
          value: 99,
        }))
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.carvedilol,
        type: UserMedicationRecommendationType.noActionRequired,
      })
    })

    it('shows carvedilol when the heart rate observations are too bad', () => {
      healthSummaryData.vitals.heartRate =
        healthSummaryData.vitals.heartRate.map((observation) => ({
          ...observation,
          value: 59,
        }))
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.carvedilol,
        type: UserMedicationRecommendationType.noActionRequired,
      })
    })

    it('recommends starting carvedilol', () => {
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        vitals: healthSummaryData.vitals,
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.carvedilol,
        type: UserMedicationRecommendationType.notStarted,
      })
    })
  })

  describe('Existing treatment: Bisoprolol', () => {
    let contextBelowTarget: MedicationRequestContext
    before(async () => {
      const request = FHIRMedicationRequest.create({
        drugReference: DrugReference.bisoprolol5,
        frequencyPerDay: 1,
        quantity: 1,
      })
      contextBelowTarget = await medicationService.getContext(request, {
        reference: 'users/mockUser/medicationRequests/someMedicationRequest',
      })
    })

    it('states that it hit target dose', async () => {
      const request = FHIRMedicationRequest.create({
        drugReference: DrugReference.bisoprolol5,
        frequencyPerDay: 1,
        quantity: 2,
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

    it('requests more blood pressure observations before recommending improvements to existing medication', () => {
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

    it('requests more heart rate observations before recommending improvements to existing medication', () => {
      healthSummaryData.vitals.heartRate =
        healthSummaryData.vitals.heartRate.slice(0, 2)
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

    it('points out a possible personal target reached when blood pressure observations before recommending improvements to existing medication', () => {
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

    it('requests more heart rate observations before recommending improvements to existing medication', () => {
      healthSummaryData.vitals.heartRate =
        healthSummaryData.vitals.heartRate.slice(0, 2)
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

    it('shows carvedilol when dizziness score is too bad', () => {
      healthSummaryData.symptomScores = healthSummaryData.symptomScores.map(
        (scores) =>
          new SymptomScore({
            ...scores,
            dizzinessScore: 4,
          }),
      )
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

    it('recommends an increase if all signs guide in that direction', () => {
      healthSummaryData.symptomScores = healthSummaryData.symptomScores.map(
        (scores) =>
          new SymptomScore({
            ...scores,
            dizzinessScore: 2,
          }),
      )
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
