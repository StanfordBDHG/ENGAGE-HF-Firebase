//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import fs from 'fs'
import {
  CachingStrategy,
  DrugReference,
  FHIRAllergyIntolerance,
  FHIRAllergyIntoleranceCriticality,
  FHIRAllergyIntoleranceType,
  FHIRMedicationRequest,
  MedicationReference,
  type Observation,
  QuantityUnit,
  SymptomScore,
  UserMedicationRecommendationType,
} from '@stanfordbdhg/engagehf-models'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { type RecommendationService } from './recommendationService.js'
import { type Vitals } from '../../models/vitals.js'
import { setupMockFirebase } from '../../tests/setup.js'
import { getServiceFactory } from '../factory/getServiceFactory.js'
import { type MedicationService } from '../medication/medicationService.js'

describe('RecommendationService', () => {
  let medicationService: MedicationService
  let recommendationService: RecommendationService

  before(async () => {
    setupMockFirebase()
    const factory = getServiceFactory()
    const staticDataService = factory.staticData()
    await staticDataService.updateMedicationClasses(CachingStrategy.expectCache)
    await staticDataService.updateMedications(CachingStrategy.expectCache)
    medicationService = factory.medication()
    recommendationService = factory.recommendation()
  })

  describe('should return the right value', () => {
    const fileContents = fs.readFileSync(
      'src/tests/resources/medtitrationtest.csv',
      'utf8',
    )
    const lines = fileContents.split('\n').slice(1)
    expect(lines).to.have.length(57)

    let lineIndex = -1
    for (const line of lines) {
      lineIndex++

      it(`line ${lineIndex}: ${line}`, async () => {
        const fields = line.split(',')
        expect(fields).to.have.length(24)

        const medicationRequests = fields
          .slice(0, 4)
          .map(getMedicationRequest)
          .flatMap((x) => (x ? [x] : []))

        const vitals = getVitals({
          countBloodPressureBelow85: parseInt(fields[4]),
          medianSystolicBloodPressure:
            fields[5] !== 'NA' ? parseInt(fields[5]) : null,
          medianHeartRate: fields[6] !== 'NA' ? parseInt(fields[6]) : null,
          potassium: parseFloat(fields[7]),
          creatinine: parseFloat(fields[8]),
          eGfr: parseFloat(fields[9]),
        })
        const dizziness = parseInt(fields[10])

        const contraindications = fields
          .slice(11, 20)
          .map((field, index) =>
            getContraindication(
              field,
              [0, 1, 2, 3].includes(index) ? FHIRAllergyIntoleranceType.allergy
              : [4, 5, 6, 7].includes(index) ?
                FHIRAllergyIntoleranceType.intolerance
              : FHIRAllergyIntoleranceType.financial,
            ),
          )
          .flatMap((x) => (x ? [x] : []))

        const expectedRecommendations = [
          getExpectedRecommendation(fields[20]),
          getExpectedRecommendation(fields[21]),
          getExpectedRecommendation(fields[22]),
          getExpectedRecommendation(fields[23]),
        ].flatMap((x) => (x ? [x] : []))

        const requestContexts = await Promise.all(
          medicationRequests.map(async (medicationRequest) =>
            medicationService.getContext(medicationRequest, {
              reference: '',
            }),
          ),
        )

        const result = await recommendationService.compute({
          requests: requestContexts,
          contraindications,
          vitals,
          latestSymptomScore: new SymptomScore({
            questionnaireResponseId: 'string',
            date: new Date(),
            overallScore: 5,
            physicalLimitsScore: 17,
            symptomFrequencyScore: 15,
            socialLimitsScore: 86,
            qualityOfLifeScore: 12,
            dizzinessScore: dizziness,
          }),
        })

        const actualRecommendations = result.map(
          (x): ExpectedRecommendation => ({
            type: x.displayInformation.type,
            recommendedMedication: x.recommendedMedication?.reference as
              | MedicationReference
              | undefined,
          }),
        )

        console.log('actualRecommendations', actualRecommendations)
        console.log('expectedRecommendations', expectedRecommendations)

        expect(actualRecommendations).to.have.length(
          expectedRecommendations.length,
        )

        for (let i = 0; i < actualRecommendations.length; i++) {
          const actual = actualRecommendations[i]
          const expected = expectedRecommendations[i]
          expect(actual.type).to.equal(expected.type)
          if (
            expected.type ===
            UserMedicationRecommendationType.improvementAvailable
          ) {
            expect(expected.recommendedMedication).to.exist
            expect(result[i].currentMedication).to.have.length.greaterThan(0)
            result[i].currentMedication.every((medication) =>
              medication.reference.startsWith(
                (expected.recommendedMedication ?? '') + '/drugs/',
              ),
            )
          } else if (expected.recommendedMedication) {
            expect(actual.recommendedMedication).to.exist
            expect(actual.recommendedMedication).to.equal(
              expected.recommendedMedication,
            )
          }
        }
      })
    }
  })
})

function getMedicationRequest(
  field: string,
): FHIRMedicationRequest | undefined {
  switch (field.trim().toLowerCase()) {
    case 'none':
      return undefined
    case 'bisoprolol 2.5mg daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.bisoprolol5,
        frequencyPerDay: 1,
        quantity: 0.5,
      })
    case 'bisoprolol 10mg daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.bisoprolol5,
        frequencyPerDay: 2,
        quantity: 1,
      })
    case 'carvedilol 6.25 daily (3.125 bid)':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.carvedilol3_125,
        frequencyPerDay: 2,
        quantity: 1,
      })
    case 'carvedilol 50mg daily (25mg twice daily)':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.carvedilol25,
        frequencyPerDay: 2,
        quantity: 1,
      })
    case 'dapagliflozin 5mg daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.dapagliflozin5,
        frequencyPerDay: 1,
        quantity: 1,
      })
    case 'dapagliflozin 10mg daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.dapagliflozin5,
        frequencyPerDay: 1,
        quantity: 2,
      })
    case 'empagliflozin 5mg daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.empagliflozin10,
        frequencyPerDay: 1,
        quantity: 0.5,
      })
    case 'empagliflozin 10mg daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.empagliflozin10,
        frequencyPerDay: 1,
        quantity: 1,
      })
    case 'eplerenone 25mg daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.eplerenone25,
        frequencyPerDay: 1,
        quantity: 1,
      })
    case 'eplerenone 50mg daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.eplerenone25,
        frequencyPerDay: 1,
        quantity: 2,
      })
    case 'lisinopril 5mg daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.lisinopril5,
        frequencyPerDay: 1,
        quantity: 1,
      })
    case 'lisinopril 40mg daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.lisinopril5,
        frequencyPerDay: 4,
        quantity: 2,
      })
    case 'losartan 25mg daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.losartan25,
        frequencyPerDay: 1,
        quantity: 1,
      })
    case 'losartan 150mg daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.losartan100,
        frequencyPerDay: 1,
        quantity: 1.5,
      })
    case 'metoprolol 12.5mg daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.metoprololSuccinate25Tablet,
        frequencyPerDay: 1,
        quantity: 0.5,
      })
    case 'metoprolol 200mg daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.metoprololSuccinate25Tablet,
        frequencyPerDay: 2,
        quantity: 4,
      })
    case 'spironolactone 12.5 daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.spironolactone25,
        frequencyPerDay: 1,
        quantity: 0.5,
      })
    case 'spironolactone 25mg daily':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.spironolactone25,
        frequencyPerDay: 1,
        quantity: 1,
      })
    case 'sacubitril-valsartan 100mg daily (24-26mg twice daily)':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.sacubitrilValsartan24_26,
        frequencyPerDay: 2,
        quantity: 1,
      })
    case 'sacubitril-valsartan 400mg daily (97-103mg twice daily)':
      return FHIRMedicationRequest.create({
        drugReference: DrugReference.sacubitrilValsartan97_103,
        frequencyPerDay: 1,
        quantity: 2,
      })
    default:
      expect.fail('Unhandled case for medication request:', field)
  }
}

function getVitals(options: {
  countBloodPressureBelow85: number
  medianSystolicBloodPressure: number | null
  medianHeartRate: number | null
  potassium: number
  creatinine: number
  eGfr: number
}): Vitals {
  const regularBloodPressureCount =
    options.medianSystolicBloodPressure ?
      Math.min(options.countBloodPressureBelow85 + 5, 10)
    : 0
  return {
    systolicBloodPressure: [
      ...Array.from(
        { length: options.countBloodPressureBelow85 },
        (_): Observation => ({
          date: new Date(),
          value: 84,
          unit: QuantityUnit.mmHg,
        }),
      ),
      ...Array.from({ length: regularBloodPressureCount }, (_) => ({
        date: new Date(),
        value: options.medianSystolicBloodPressure ?? 110,
        unit: QuantityUnit.mmHg,
      })),
    ],
    diastolicBloodPressure: Array.from(
      { length: options.countBloodPressureBelow85 + regularBloodPressureCount },
      (_) => ({
        date: new Date(),
        value: 74,
        unit: QuantityUnit.mmHg,
      }),
    ),
    heartRate: Array.from(
      { length: options.medianHeartRate !== null ? 10 : 0 },
      (_) => ({
        date: new Date(),
        value: options.medianHeartRate ?? 0,
        unit: QuantityUnit.bpm,
      }),
    ),
    bodyWeight: Array.from({ length: 10 }, (_) => ({
      date: new Date(),
      value: 70,
      unit: QuantityUnit.kg,
    })),
    creatinine: {
      date: new Date(),
      value: options.creatinine,
      unit: QuantityUnit.mg_dL,
    },
    estimatedGlomerularFiltrationRate: {
      date: new Date(),
      value: options.eGfr,
      unit: QuantityUnit.mL_min_173m2,
    },
    potassium: {
      date: new Date(),
      value: options.potassium,
      unit: QuantityUnit.mEq_L,
    },
  }
}

function getContraindication(
  field: string,
  type: FHIRAllergyIntoleranceType,
): FHIRAllergyIntolerance | undefined {
  switch (field.trim().toLowerCase().split(' ').join('')) {
    case 'none':
      return undefined
    case 'carvedilol':
      return FHIRAllergyIntolerance.create({
        reference: MedicationReference.carvedilol,
        type,
        criticality: FHIRAllergyIntoleranceCriticality.low,
      })
    case 'lisinopril':
      return FHIRAllergyIntolerance.create({
        reference: MedicationReference.lisinopril,
        type,
        criticality: FHIRAllergyIntoleranceCriticality.low,
      })
    case 'lisinopril-anaphylaxis':
      return FHIRAllergyIntolerance.create({
        reference: MedicationReference.lisinopril,
        type,
        criticality: FHIRAllergyIntoleranceCriticality.high,
      })
    case 'spironolactone':
      return FHIRAllergyIntolerance.create({
        reference: MedicationReference.spironolactone,
        type,
        criticality: FHIRAllergyIntoleranceCriticality.low,
      })
    case 'sacubitril-valsartan':
      return FHIRAllergyIntolerance.create({
        reference: MedicationReference.sacubitrilValsartan,
        type,
        criticality: FHIRAllergyIntoleranceCriticality.low,
      })
    case 'dapagliflozin':
      return FHIRAllergyIntolerance.create({
        reference: MedicationReference.dapagliflozin,
        type,
        criticality: FHIRAllergyIntoleranceCriticality.low,
      })
    case 'empagliflozin':
      return FHIRAllergyIntolerance.create({
        reference: MedicationReference.empagliflozin,
        type,
        criticality: FHIRAllergyIntoleranceCriticality.low,
      })
    case 'sotagliflozin':
      return FHIRAllergyIntolerance.create({
        reference: MedicationReference.sotagliflozin,
        type,
        criticality: FHIRAllergyIntoleranceCriticality.low,
      })
    case 'valsartan':
      return FHIRAllergyIntolerance.create({
        reference: MedicationReference.valsartan,
        type,
        criticality: FHIRAllergyIntoleranceCriticality.low,
      })
    default:
      expect.fail('Unhandled case for contraindication:', field)
  }
}

interface ExpectedRecommendation {
  type: UserMedicationRecommendationType
  recommendedMedication?: MedicationReference
}

function getExpectedRecommendation(
  field: string,
): ExpectedRecommendation | undefined {
  switch (field.trim().toLowerCase()) {
    case 'no med listed':
      return undefined
    case 'no message - carvedilol listed':
      return {
        type: UserMedicationRecommendationType.noActionRequired,
        recommendedMedication: MedicationReference.carvedilol,
      }
    case 'no message - empagliflozin listed':
      return {
        type: UserMedicationRecommendationType.noActionRequired,
        recommendedMedication: MedicationReference.empagliflozin,
      }
    case 'no message - sacubitril-valsartan listed':
      return {
        type: UserMedicationRecommendationType.noActionRequired,
        recommendedMedication: MedicationReference.sacubitrilValsartan,
      }
    case 'no message - spironolactone listed':
      return {
        type: UserMedicationRecommendationType.noActionRequired,
        recommendedMedication: MedicationReference.spironolactone,
      }
    case 'discuss increasing bisoprolol':
      return {
        type: UserMedicationRecommendationType.improvementAvailable,
        recommendedMedication: MedicationReference.bisoprolol,
      }
    case 'discuss increasing carvedilol':
      return {
        type: UserMedicationRecommendationType.improvementAvailable,
        recommendedMedication: MedicationReference.carvedilol,
      }
    case 'discuss increasing dapagliflozin':
      return {
        type: UserMedicationRecommendationType.improvementAvailable,
        recommendedMedication: MedicationReference.dapagliflozin,
      }
    case 'discuss increasing empagliflozin':
      return {
        type: UserMedicationRecommendationType.improvementAvailable,
        recommendedMedication: MedicationReference.empagliflozin,
      }
    case 'discuss increasing eplerenone':
      return {
        type: UserMedicationRecommendationType.improvementAvailable,
        recommendedMedication: MedicationReference.eplerenone,
      }
    case 'discuss increasing lisinopril':
      return {
        type: UserMedicationRecommendationType.improvementAvailable,
        recommendedMedication: MedicationReference.lisinopril,
      }
    case 'discuss increasing losartan':
      return {
        type: UserMedicationRecommendationType.improvementAvailable,
        recommendedMedication: MedicationReference.losartan,
      }
    case 'discuss increasing metoprolol':
      return {
        type: UserMedicationRecommendationType.improvementAvailable,
        recommendedMedication: MedicationReference.metoprololSuccinate,
      }
    case 'discuss increasing sacubitril-valsartan':
      return {
        type: UserMedicationRecommendationType.improvementAvailable,
        recommendedMedication: MedicationReference.sacubitrilValsartan,
      }
    case 'discuss increasing spironolactone':
      return {
        type: UserMedicationRecommendationType.improvementAvailable,
        recommendedMedication: MedicationReference.spironolactone,
      }
    case 'discuss starting carvedilol':
      return {
        type: UserMedicationRecommendationType.notStarted,
        recommendedMedication: MedicationReference.carvedilol,
      }
    case 'discuss starting dapagliflozin':
      return {
        type: UserMedicationRecommendationType.notStarted,
        recommendedMedication: MedicationReference.dapagliflozin,
      }
    case 'discuss starting empagliflozin':
      return {
        type: UserMedicationRecommendationType.notStarted,
        recommendedMedication: MedicationReference.empagliflozin,
      }
    case 'discuss starting eplerenone':
      return {
        type: UserMedicationRecommendationType.notStarted,
        recommendedMedication: MedicationReference.eplerenone,
      }
    case 'discuss starting losartan':
      return {
        type: UserMedicationRecommendationType.notStarted,
        recommendedMedication: MedicationReference.losartan,
      }
    case 'discuss starting metoprolol':
      return {
        type: UserMedicationRecommendationType.notStarted,
        recommendedMedication: MedicationReference.metoprololSuccinate,
      }
    case 'discuss starting sacubitril-valsartan':
      return {
        type: UserMedicationRecommendationType.notStarted,
        recommendedMedication: MedicationReference.sacubitrilValsartan,
      }
    case 'discuss starting sacubitril-valsartan (more effective med)':
      return {
        type: UserMedicationRecommendationType.improvementAvailable,
        recommendedMedication: MedicationReference.sacubitrilValsartan,
      }
    case 'discuss starting spironolactone':
      return {
        type: UserMedicationRecommendationType.notStarted,
        recommendedMedication: MedicationReference.spironolactone,
      }
    case 'goal dose reached':
      return {
        type: UserMedicationRecommendationType.targetDoseReached,
      }
    case 'measure bp':
    case 'measure bb/hr':
      return {
        type: UserMedicationRecommendationType.morePatientObservationsRequired,
      }
    case 'possible personal target reached':
      return {
        type: UserMedicationRecommendationType.personalTargetDoseReached,
      }
    default:
      expect.fail('Unhandled case for expected recommendation:', field)
  }
}
