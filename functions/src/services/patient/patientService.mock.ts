//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type PatientService } from './patientService.js'
import { type FHIRAllergyIntolerance } from '../../models/fhir/allergyIntolerance.js'
import {
  AppointmentStatus,
  type FHIRAppointment,
} from '../../models/fhir/appointment.js'
import { type FHIRMedicationRequest } from '../../models/fhir/medication.js'
import {
  type FHIRObservation,
  FHIRObservationStatus,
} from '../../models/fhir/observation.js'
import { type FHIRQuestionnaireResponse } from '../../models/fhir/questionnaireResponse.js'
import { type MedicationRecommendation } from '../../models/medicationRecommendation.js'
import { type SymptomScore } from '../../models/symptomScore.js'
import { mockQuestionnaireResponse } from '../../tests/mocks/questionnaireResponse.js'
import { CodingSystem, LoincCode } from '../codes.js'
import { type Document } from '../database/databaseService.js'
import { QuantityUnit } from '../fhir/quantityUnit.js'

/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */

export class MockPatientService implements PatientService {
  // Methods - Appointments

  async getAppointments(
    userId: string,
  ): Promise<Array<Document<FHIRAppointment>>> {
    return []
  }
  async getNextAppointment(
    userId: string,
  ): Promise<Document<FHIRAppointment> | undefined> {
    return {
      id: '123',
      content: {
        resourceType: 'Appointment',
        status: AppointmentStatus.pending,
        created: new Date('2024-01-01').toISOString(),
        start: new Date('2024-02-03').toISOString(),
        end: new Date('2024-02-03').toISOString(),
        participant: [
          {
            actor: {
              reference: `users/${userId}`,
            },
          },
        ],
      },
    }
  }

  // Methods - AllergyIntolerances

  async getAllergyIntolerances(
    userId: string,
  ): Promise<Array<Document<FHIRAllergyIntolerance>>> {
    return []
  }

  // Methods - Medication Requests

  async getMedicationRecommendations(
    userId: string,
  ): Promise<Array<Document<MedicationRecommendation>>> {
    const values: MedicationRecommendation[] = []
    return values.map((value, index) => ({
      id: index.toString(),
      content: value,
    }))
  }

  async getMedicationRequests(
    userId: string,
  ): Promise<Array<Document<FHIRMedicationRequest>>> {
    const values: FHIRMedicationRequest[] = [
      {
        resourceType: 'MedicationRequest',
        medicationReference: {
          reference: 'medications/203160/drugs/20352',
        },
        dosageInstruction: [
          {
            doseAndRate: [
              {
                doseQuantity: {
                  ...QuantityUnit.mg,
                  value: 6.25,
                },
              },
            ],
          },
        ],
      },
    ]
    return values.map((value, index) => ({
      id: index.toString(),
      content: value,
    }))
  }

  // Methods - Observations

  async getBloodPressureObservations(
    userId: string,
  ): Promise<Array<Document<FHIRObservation>>> {
    const values = [
      this.bloodPressureObservation(110, 70, new Date('2024-02-01')),
      this.bloodPressureObservation(114, 82, new Date('2024-01-31')),
      this.bloodPressureObservation(123, 75, new Date('2024-01-30')),
      this.bloodPressureObservation(109, 77, new Date('2024-01-29')),
      this.bloodPressureObservation(105, 72, new Date('2024-01-28')),
      this.bloodPressureObservation(98, 68, new Date('2024-01-27')),
      this.bloodPressureObservation(94, 65, new Date('2024-01-26')),
      this.bloodPressureObservation(104, 72, new Date('2024-01-25')),
      this.bloodPressureObservation(102, 80, new Date('2024-01-24')),
    ]
    return values.map((value, index) => ({
      id: index.toString(),
      content: value,
    }))
  }

  private bloodPressureObservation(
    systolicBloodPressure: number,
    diastolicBloodPressure: number,
    date: Date,
  ): FHIRObservation {
    return {
      resourceType: 'Observation',
      code: {
        coding: [
          {
            code: '85354-9',
            display: 'Blood pressure panel',
            system: 'http://loinc.org',
          },
        ],
      },
      component: [
        {
          code: {
            coding: [
              {
                code: '8480-6',
                display: 'Systolic blood pressure',
                system: 'http://loinc.org',
              },
              {
                code: 'HKQuantityTypeIdentifierBloodPressureSystolic',
                display: 'Blood Pressure Systolic',
                system: 'http://developer.apple.com/documentation/healthkit',
              },
            ],
          },
          valueQuantity: {
            ...QuantityUnit.mmHg,
            value: systolicBloodPressure,
          },
        },
        {
          code: {
            coding: [
              {
                code: '8462-4',
                display: 'Diastolic blood pressure',
                system: 'http://loinc.org',
              },
              {
                code: 'HKQuantityTypeIdentifierBloodPressureDiastolic',
                display: 'Blood Pressure Diastolic',
                system: 'http://developer.apple.com/documentation/healthkit',
              },
            ],
          },
          valueQuantity: {
            ...QuantityUnit.mmHg,
            value: diastolicBloodPressure,
          },
        },
      ],
      effectiveDateTime: date.toISOString(),
      id: 'DDA0F363-2BA3-426F-9F68-1C938FFDF943',
      status: FHIRObservationStatus.final,
    }
  }

  async getBodyWeightObservations(
    userId: string,
  ): Promise<Array<Document<FHIRObservation>>> {
    const values = [
      this.bodyWeightObservation(269, QuantityUnit.lbs, new Date('2024-02-01')),
      this.bodyWeightObservation(267, QuantityUnit.lbs, new Date('2024-01-31')),
      this.bodyWeightObservation(267, QuantityUnit.lbs, new Date('2024-01-30')),
      this.bodyWeightObservation(265, QuantityUnit.lbs, new Date('2024-01-29')),
      this.bodyWeightObservation(268, QuantityUnit.lbs, new Date('2024-01-28')),
      this.bodyWeightObservation(268, QuantityUnit.lbs, new Date('2024-01-27')),
      this.bodyWeightObservation(266, QuantityUnit.lbs, new Date('2024-01-26')),
      this.bodyWeightObservation(266, QuantityUnit.lbs, new Date('2024-01-25')),
      this.bodyWeightObservation(267, QuantityUnit.lbs, new Date('2024-01-24')),
    ]
    return values.map((value, index) => ({
      id: index.toString(),
      content: value,
    }))
  }

  private bodyWeightObservation(
    value: number,
    unit: QuantityUnit,
    date: Date,
  ): FHIRObservation {
    return {
      resourceType: 'Observation',
      code: {
        coding: [
          {
            code: '29463-7',
            display: 'Body weight',
            system: 'http://loinc.org',
          },
          {
            code: 'HKQuantityTypeIdentifierBodyMass',
            display: 'Body Mass',
            system: 'http://developer.apple.com/documentation/healthkit',
          },
        ],
      },
      effectiveDateTime: date.toISOString(),
      status: FHIRObservationStatus.final,
      valueQuantity: {
        ...unit,
        value,
      },
    }
  }

  async getHeartRateObservations(
    userId: string,
  ): Promise<Array<Document<FHIRObservation>>> {
    const values = [
      this.heartRateObservation(79, new Date('2024-02-01')),
      this.heartRateObservation(62, new Date('2024-01-31')),
      this.heartRateObservation(77, new Date('2024-01-30')),
      this.heartRateObservation(63, new Date('2024-01-29')),
      this.heartRateObservation(61, new Date('2024-01-28')),
      this.heartRateObservation(70, new Date('2024-01-27')),
      this.heartRateObservation(67, new Date('2024-01-26')),
      this.heartRateObservation(80, new Date('2024-01-25')),
      this.heartRateObservation(65, new Date('2024-01-24')),
    ]
    return values.map((value, index) => ({
      id: index.toString(),
      content: value,
    }))
  }

  private heartRateObservation(value: number, date: Date): FHIRObservation {
    return {
      resourceType: 'Observation',
      code: {
        coding: [
          {
            code: '8867-4',
            display: 'Heart rate',
            system: 'http://loinc.org',
          },
          {
            code: 'HKQuantityTypeIdentifierHeartRate',
            display: 'Heart Rate',
            system: 'http://developer.apple.com/documentation/healthkit',
          },
        ],
      },
      effectiveDateTime: date.toISOString(),
      id: 'C38FFD7E-7B86-4C79-9C8A-0B90E2F3DF14',
      status: FHIRObservationStatus.final,
      valueQuantity: {
        ...QuantityUnit.bpm,
        value: value,
      },
    }
  }

  async getMostRecentCreatinineObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined> {
    return {
      id: '0',
      content: {
        resourceType: 'Observation',
        code: {
          coding: [
            {
              code: LoincCode.creatinine,
              display: 'Creatinine [Mass/volume] in Serum or Plasma',
              system: CodingSystem.loinc,
            },
          ],
        },
        effectiveDateTime: new Date('2024-01-29').toISOString(),
        status: FHIRObservationStatus.final,
        valueQuantity: {
          ...QuantityUnit.mg_dL,
          value: 1.1,
        },
      },
    }
  }

  async getMostRecentDryWeightObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined> {
    return {
      id: '0',
      content: {
        resourceType: 'Observation',
        code: {
          coding: [
            {
              code: LoincCode.bodyWeight,
              display: 'Body weight',
              system: CodingSystem.loinc,
            },
          ],
        },
        effectiveDateTime: new Date('2024-01-29').toISOString(),
        status: FHIRObservationStatus.final,
        valueQuantity: {
          ...QuantityUnit.lbs,
          value: 267.5,
        },
      },
    }
  }

  async getMostRecentEstimatedGlomerularFiltrationRateObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined> {
    return {
      id: '0',
      content: {
        resourceType: 'Observation',
        code: {
          coding: [
            {
              code: LoincCode.estimatedGlomerularFiltrationRate,
              display:
                'Glomerular filtration rate/1.73 sq M.predicted [Volume Rate/Area] in Serum, Plasma or Blood by Creatinine-based formula (CKD-EPI 2021)',
              system: CodingSystem.loinc,
            },
          ],
        },
        effectiveDateTime: new Date('2024-01-29').toISOString(),
        status: FHIRObservationStatus.final,
        valueQuantity: {
          ...QuantityUnit.mL_min_173m2,
          value: 60,
        },
      },
    }
  }

  async getMostRecentPotassiumObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined> {
    return {
      id: '0',
      content: {
        resourceType: 'Observation',
        code: {
          coding: [
            {
              code: LoincCode.potassium,
              display: 'Potassium [Moles/volume] in Blood',
              system: CodingSystem.loinc,
            },
          ],
        },
        effectiveDateTime: new Date('2024-01-29').toISOString(),
        status: FHIRObservationStatus.final,
        valueQuantity: {
          ...QuantityUnit.mEq_L,
          value: 4.2,
        },
      },
    }
  }

  // Methods - Questionnaire Responses

  async getQuestionnaireResponses(
    userId: string,
  ): Promise<Array<Document<FHIRQuestionnaireResponse>>> {
    return [mockQuestionnaireResponse()].map((value, index) => ({
      id: index.toString(),
      content: value,
    }))
  }

  async getSymptomScores(
    userId: string,
  ): Promise<Array<Document<SymptomScore>>> {
    const values: SymptomScore[] = [
      {
        overallScore: 40,
        physicalLimitsScore: 50,
        socialLimitsScore: 38,
        qualityOfLifeScore: 20,
        symptomFrequencyScore: 60,
        dizzinessScore: 50,
        date: new Date('2024-01-24'),
      },
      {
        overallScore: 60,
        physicalLimitsScore: 58,
        socialLimitsScore: 75,
        qualityOfLifeScore: 37,
        symptomFrequencyScore: 72,
        dizzinessScore: 70,
        date: new Date('2024-01-15'),
      },
      {
        overallScore: 44,
        physicalLimitsScore: 50,
        socialLimitsScore: 41,
        qualityOfLifeScore: 25,
        symptomFrequencyScore: 60,
        dizzinessScore: 50,
        date: new Date('2023-12-30'),
      },
      {
        overallScore: 75,
        physicalLimitsScore: 58,
        socialLimitsScore: 75,
        qualityOfLifeScore: 60,
        symptomFrequencyScore: 80,
        dizzinessScore: 100,
        date: new Date('2023-12-15'),
      },
    ]
    return values.map((value, index) => ({
      id: index.toString(),
      content: value,
    }))
  }
}
