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
import { QuantityUnit } from '../../fhir/quantityUnit.js'
import { type MedicationService } from '../../medication/medicationService.js'
import {
  DrugReference,
  MedicationClassReference,
  MedicationReference,
} from '../../references.js'
import { CachingStrategy } from '../../seeding/seedingService.js'

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
    healthSummaryData.symptomScores = healthSummaryData.symptomScores.map(
      (score) =>
        new SymptomScore({
          ...score,
          dizzinessScore: 0,
        }),
    )
    medicationContraindication = (_) => ContraindicationCategory.none
    medicationClassContraindication = (_) => ContraindicationCategory.none
  })

  after(() => {
    cleanupMocks()
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
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
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
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(0)
    })

    it('shows sacubitril-valsartan when clinician-listed contraindications are present', () => {
      medicationContraindication = (_) =>
        ContraindicationCategory.clinicianListed
      medicationClassContraindication = (_) =>
        ContraindicationCategory.clinicianListed

      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.sacubitrilValsartan,
        type: UserMedicationRecommendationType.noActionRequired,
      })
    })

    it('requests more blood pressure observations', () => {
      healthSummaryData.vitals.systolicBloodPressure =
        healthSummaryData.vitals.systolicBloodPressure.slice(0, 2)
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.sacubitrilValsartan,
        type: UserMedicationRecommendationType.morePatientObservationsRequired,
      })
    })

    it('shows sacubitril-valsartan when median systolic is below 100', () => {
      healthSummaryData.vitals.systolicBloodPressure.forEach((observation) => {
        observation.value = 99
      })
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.sacubitrilValsartan,
        type: UserMedicationRecommendationType.noActionRequired,
      })
    })

    it('shows sacubitril-valsartan when creatinine is too high', () => {
      healthSummaryData.vitals.creatinine = {
        date: new Date(),
        value: 2.5,
        unit: QuantityUnit.mg_dL,
      }
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.sacubitrilValsartan,
        type: UserMedicationRecommendationType.noActionRequired,
      })
    })

    it('shows sacubitril-valsartan when potassium is too high', () => {
      healthSummaryData.vitals.potassium = {
        date: new Date(),
        value: 6,
        unit: QuantityUnit.mEq_L,
      }
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.sacubitrilValsartan,
        type: UserMedicationRecommendationType.noActionRequired,
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
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.losartan,
        type: UserMedicationRecommendationType.notStarted,
      })
    })

    it('shows sacubitril-valsartan', () => {
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [],
        recommendedMedication: MedicationReference.sacubitrilValsartan,
        type: UserMedicationRecommendationType.notStarted,
      })
    })
  })

  describe('On perindopril (ACEI/ARB)', () => {
    let contextBelowTarget: MedicationRequestContext
    before(async () => {
      const request = FHIRMedicationRequest.create({
        drugReference: DrugReference.perindopril4,
        frequencyPerDay: 1,
        quantity: 1,
      })
      contextBelowTarget = await medicationService.getContext(request, {
        reference: 'users/mockUser/medicationRequests/someMedicationRequest',
      })
    })

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

      it('detects target dose reached', async () => {
        const request = FHIRMedicationRequest.create({
          drugReference: DrugReference.perindopril4,
          frequencyPerDay: 2,
          quantity: 2,
        })
        const contextAtTarget = await medicationService.getContext(request, {
          reference: 'users/mockUser/medicationRequests/someMedicationRequest',
        })
        const result = recommender.compute({
          requests: [contextAtTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          latestSymptomScore: healthSummaryData.symptomScores.at(-1),
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
          vitals: healthSummaryData.vitals,
          latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget],
          recommendedMedication: undefined,
          type: UserMedicationRecommendationType.morePatientObservationsRequired,
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
          latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget],
          recommendedMedication: undefined,
          type: UserMedicationRecommendationType.personalTargetDoseReached,
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
          latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget],
          recommendedMedication: undefined,
          type: UserMedicationRecommendationType.personalTargetDoseReached,
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
          latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget],
          recommendedMedication: undefined,
          type: UserMedicationRecommendationType.personalTargetDoseReached,
        })
      })

      it('detects personal target reached with dizziness score too high', () => {
        healthSummaryData.symptomScores = healthSummaryData.symptomScores.map(
          (score) =>
            new SymptomScore({
              ...score,
              dizzinessScore: 3,
            }),
        )
        const result = recommender.compute({
          requests: [contextBelowTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          latestSymptomScore: healthSummaryData.symptomScores.at(-1),
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
          vitals: healthSummaryData.vitals,
          latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget],
          recommendedMedication: undefined,
          type: UserMedicationRecommendationType.improvementAvailable,
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
          latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget],
          recommendedMedication: undefined,
          type: UserMedicationRecommendationType.morePatientObservationsRequired,
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
          latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget],
          recommendedMedication: undefined,
          type: UserMedicationRecommendationType.personalTargetDoseReached,
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
          latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget],
          recommendedMedication: undefined,
          type: UserMedicationRecommendationType.personalTargetDoseReached,
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
          latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget],
          recommendedMedication: undefined,
          type: UserMedicationRecommendationType.personalTargetDoseReached,
        })
      })

      it('detects personal target reached with dizziness score too high', () => {
        healthSummaryData.symptomScores = healthSummaryData.symptomScores.map(
          (score) =>
            new SymptomScore({
              ...score,
              dizzinessScore: 3,
            }),
        )
        const result = recommender.compute({
          requests: [contextBelowTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget],
          recommendedMedication: undefined,
          type: UserMedicationRecommendationType.personalTargetDoseReached,
        })
      })

      it('recommends change to ARNI', () => {
        const result = recommender.compute({
          requests: [contextBelowTarget],
          contraindications: [],
          vitals: healthSummaryData.vitals,
          latestSymptomScore: healthSummaryData.symptomScores.at(-1),
        })
        expect(result).to.have.length(1)
        expect(result.at(0)).to.deep.equal({
          currentMedication: [contextBelowTarget],
          recommendedMedication: MedicationReference.sacubitrilValsartan,
          type: UserMedicationRecommendationType.improvementAvailable,
        })
      })
    })
  })

  describe('On sacubitril/valsartan', () => {
    let contextBelowTarget: MedicationRequestContext
    before(async () => {
      const request = FHIRMedicationRequest.create({
        drugReference: DrugReference.sacubitrilValsartan49_51,
        frequencyPerDay: 1,
        quantity: 1,
      })
      contextBelowTarget = await medicationService.getContext(request, {
        reference: 'users/mockUser/medicationRequests/someMedicationRequest',
      })
    })

    it('detects target dose reached', async () => {
      const request = FHIRMedicationRequest.create({
        drugReference: DrugReference.sacubitrilValsartan49_51,
        frequencyPerDay: 2,
        quantity: 2,
      })
      const contextAtTarget = await medicationService.getContext(request, {
        reference: 'users/mockUser/medicationRequests/someMedicationRequest',
      })
      const result = recommender.compute({
        requests: [contextAtTarget],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
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
        vitals: healthSummaryData.vitals,
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget],
        recommendedMedication: undefined,
        type: UserMedicationRecommendationType.morePatientObservationsRequired,
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
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget],
        recommendedMedication: undefined,
        type: UserMedicationRecommendationType.personalTargetDoseReached,
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
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget],
        recommendedMedication: undefined,
        type: UserMedicationRecommendationType.personalTargetDoseReached,
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
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: [contextBelowTarget],
        recommendedMedication: undefined,
        type: UserMedicationRecommendationType.personalTargetDoseReached,
      })
    })

    it('detects personal target dose when dizziness is too high', () => {
      healthSummaryData.symptomScores = healthSummaryData.symptomScores.map(
        (score) =>
          new SymptomScore({
            ...score,
            dizzinessScore: 3,
          }),
      )
      const result = recommender.compute({
        requests: [contextBelowTarget],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
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
        vitals: healthSummaryData.vitals,
        latestSymptomScore: healthSummaryData.symptomScores.at(-1),
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
