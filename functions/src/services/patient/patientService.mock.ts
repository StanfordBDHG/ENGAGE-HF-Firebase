//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type PatientService } from './patientService.js'
import { FHIRMedicationRequest } from '../../models/fhir/baseTypes/fhirElement.js'
import { type FHIRAllergyIntolerance } from '../../models/fhir/fhirAllergyIntolerance.js'
import {
  FHIRAppointmentStatus,
  FHIRAppointment,
} from '../../models/fhir/fhirAppointment.js'
import { FHIRObservation } from '../../models/fhir/fhirObservation.js'
import { type FHIRQuestionnaireResponse } from '../../models/fhir/fhirQuestionnaireResponse.js'
import { SymptomScore } from '../../models/types/symptomScore.js'
import { type UserMedicationRecommendation } from '../../models/types/userMedicationRecommendation.js'
import { mockQuestionnaireResponse } from '../../tests/mocks/questionnaireResponse.js'
import { LoincCode } from '../codes.js'
import { type Document } from '../database/databaseService.js'
import { QuantityUnit } from '../fhir/quantityUnit.js'

/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */

export class MockPatientService implements PatientService {
  // Methods - Appointments

  async getEveryAppoinment(
    fromDate: Date,
    toDate: Date,
  ): Promise<Array<Document<FHIRAppointment>>> {
    return []
  }
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
      path: 'appointments/123',
      content: new FHIRAppointment({
        resourceType: 'Appointment',
        status: FHIRAppointmentStatus.pending,
        created: new Date('2024-01-01'),
        start: new Date('2024-02-03'),
        end: new Date('2024-02-03'),
        participant: [],
      }),
    }
  }

  // Methods - Contraindications

  async getContraindications(
    userId: string,
  ): Promise<Array<Document<FHIRAllergyIntolerance>>> {
    return []
  }

  // Methods - Medication Requests

  async getMedicationRecommendations(
    userId: string,
  ): Promise<Array<Document<UserMedicationRecommendation>>> {
    const values: UserMedicationRecommendation[] = []
    return values.map((value, index) => ({
      id: index.toString(),
      path: `users/${userId}/medicationRecommendations/${index}`,
      content: value,
    }))
  }

  async getMedicationRequests(
    userId: string,
  ): Promise<Array<Document<FHIRMedicationRequest>>> {
    const values: FHIRMedicationRequest[] = [
      new FHIRMedicationRequest({
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
      }),
    ]
    return values.map((value, index) => ({
      id: index.toString(),
      path: `users/${userId}/medicationRequests/${index}`,
      content: value,
    }))
  }

  async updateMedicationRecommendations(
    userId: string,
    recommendations: UserMedicationRecommendation[],
  ): Promise<void> {
    return
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
      path: `users/${userId}/bloodPressureObservations/${index}`,
      content: value,
    }))
  }

  private bloodPressureObservation(
    systolicBloodPressure: number,
    diastolicBloodPressure: number,
    date: Date,
  ): FHIRObservation {
    return FHIRObservation.createBloodPressure({
      id: 'DDA0F363-2BA3-426F-9F68-1C938FFDF943',
      systolic: systolicBloodPressure,
      diastolic: diastolicBloodPressure,
      date,
    })
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
      path: `users/${userId}/bodyWeightObservations/${index}`,
      content: value,
    }))
  }

  private bodyWeightObservation(
    value: number,
    unit: QuantityUnit,
    date: Date,
  ): FHIRObservation {
    return FHIRObservation.createSimple({
      id: 'C38FFD7E-7B86-4C79-9C8A-0B90E2F3DF14',
      date: date,
      value: value,
      unit: unit,
      code: LoincCode.bodyWeight,
    })
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
      path: `users/${userId}/heartRateObservations/${index}`,
      content: value,
    }))
  }

  private heartRateObservation(value: number, date: Date): FHIRObservation {
    return FHIRObservation.createSimple({
      id: 'C38FFD7E-7B86-4C79-9C8A-0B90E2F3DF14',
      date: date,
      value: value,
      unit: QuantityUnit.bpm,
      code: LoincCode.heartRate,
    })
  }

  async getMostRecentCreatinineObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined> {
    return {
      id: '0',
      path: `users/${userId}/creatinineObservations/0`,
      content: FHIRObservation.createSimple({
        id: '0',
        date: new Date('2024-01-29'),
        value: 1.1,
        unit: QuantityUnit.mg_dL,
        code: LoincCode.creatinine,
      }),
    }
  }

  async getMostRecentDryWeightObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined> {
    return {
      id: '0',
      path: `users/${userId}/dryWeightObservations/0`,
      content: FHIRObservation.createSimple({
        id: '0',
        date: new Date('2024-01-29'),
        value: 267.5,
        unit: QuantityUnit.lbs,
        code: LoincCode.bodyWeight,
      }),
    }
  }

  async getMostRecentEstimatedGlomerularFiltrationRateObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined> {
    return {
      id: '0',
      path: `users/${userId}/eGfrObservations/0`,
      content: FHIRObservation.createSimple({
        id: '0',
        date: new Date('2024-01-29'),
        value: 60,
        unit: QuantityUnit.mL_min_173m2,
        code: LoincCode.estimatedGlomerularFiltrationRate,
      }),
    }
  }

  async getMostRecentPotassiumObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined> {
    return {
      id: '0',
      path: `users/${userId}/potassiumObservations/0`,
      content: FHIRObservation.createSimple({
        id: '0',
        date: new Date('2024-01-29'),
        value: 4.2,
        unit: QuantityUnit.mEq_L,
        code: LoincCode.potassium,
      }),
    }
  }

  // Methods - Questionnaire Responses

  async getQuestionnaireResponses(
    userId: string,
  ): Promise<Array<Document<FHIRQuestionnaireResponse>>> {
    return [mockQuestionnaireResponse()].map((value, index) => ({
      id: index.toString(),
      path: `users/${userId}/questionnaireResponses/${index}`,
      content: value,
    }))
  }

  async getSymptomScores(
    userId: string,
    limit: number | null,
  ): Promise<Array<Document<SymptomScore>>> {
    const values: SymptomScore[] = [
      new SymptomScore({
        questionnaireResponseId: '4',
        overallScore: 40,
        physicalLimitsScore: 50,
        socialLimitsScore: 38,
        qualityOfLifeScore: 20,
        symptomFrequencyScore: 60,
        dizzinessScore: 50,
        date: new Date('2024-01-24'),
      }),
      new SymptomScore({
        questionnaireResponseId: '3',
        overallScore: 60,
        physicalLimitsScore: 58,
        socialLimitsScore: 75,
        qualityOfLifeScore: 37,
        symptomFrequencyScore: 72,
        dizzinessScore: 70,
        date: new Date('2024-01-15'),
      }),
      new SymptomScore({
        questionnaireResponseId: '2',
        overallScore: 44,
        physicalLimitsScore: 50,
        socialLimitsScore: 41,
        qualityOfLifeScore: 25,
        symptomFrequencyScore: 60,
        dizzinessScore: 50,
        date: new Date('2023-12-30'),
      }),
      new SymptomScore({
        questionnaireResponseId: '1',
        overallScore: 75,
        physicalLimitsScore: 58,
        socialLimitsScore: 75,
        qualityOfLifeScore: 60,
        symptomFrequencyScore: 80,
        dizzinessScore: 100,
        date: new Date('2023-12-15'),
      }),
    ]
    return values.map((value, index) => ({
      id: index.toString(),
      path: `users/${userId}/symptomScores/${index}`,
      content: value,
    }))
  }

  async getLatestSymptomScore(
    userId: string,
  ): Promise<Document<SymptomScore> | undefined> {
    return (await this.getSymptomScores(userId, null)).at(0)
  }

  async updateSymptomScore(
    userId: string,
    symptomScoreId: string,
    symptomScore: SymptomScore | undefined,
  ): Promise<void> {
    return
  }
}
