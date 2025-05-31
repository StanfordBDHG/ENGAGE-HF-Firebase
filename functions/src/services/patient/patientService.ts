//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type Observation,
  type QuantityUnit,
  type FHIRAllergyIntolerance,
  type FHIRAppointment,
  type FHIRMedicationRequest,
  type FHIRQuestionnaireResponse,
  type SymptomScore,
  type UserMedicationRecommendation,
  type UserShareCode,
  type UserObservationCollection,
  type LoincCode,
  type FHIRReference,
} from '@stanfordbdhg/engagehf-models'
import { type Document } from '../database/databaseService.js'

export interface PatientService {
  // Appointments

  getEveryAppoinment(
    fromDate: Date,
    toDate: Date,
  ): Promise<Array<Document<FHIRAppointment>>>

  getAppointments(userId: string): Promise<Array<Document<FHIRAppointment>>>
  getNextAppointment(
    userId: string,
  ): Promise<Document<FHIRAppointment> | undefined>

  createAppointment(userId: string, appointment: FHIRAppointment): Promise<void>

  // Contraindications

  getContraindications(
    userId: string,
  ): Promise<Array<Document<FHIRAllergyIntolerance>>>

  // Medication Requests

  getMedicationRequests(
    userId: string,
  ): Promise<Array<Document<FHIRMedicationRequest>>>
  replaceMedicationRequests(
    userId: string,
    values: FHIRMedicationRequest[],
    keepUnchanged?: (request: Document<FHIRMedicationRequest>) => boolean,
  ): Promise<void>

  getMedicationRecommendations(
    userId: string,
  ): Promise<Array<Document<UserMedicationRecommendation>>>
  replaceMedicationRecommendations(
    userId: string,
    recommendations: UserMedicationRecommendation[],
  ): Promise<void>

  // Observations

  getBloodPressureObservations(
    userId: string,
    cutoffDate: Date,
  ): Promise<[Observation[], Observation[]]>
  getBodyWeightObservations(
    userId: string,
    unit: QuantityUnit,
    cutoffDate: Date,
  ): Promise<Observation[]>
  getHeartRateObservations(
    userId: string,
    cutoffDate: Date,
  ): Promise<Observation[]>

  getMostRecentCreatinineObservation(
    userId: string,
  ): Promise<Observation | undefined>
  getMostRecentDryWeightObservation(
    userId: string,
    unit: QuantityUnit,
  ): Promise<Observation | undefined>
  getMostRecentEstimatedGlomerularFiltrationRateObservation(
    userId: string,
  ): Promise<Observation | undefined>
  getMostRecentPotassiumObservation(
    userId: string,
  ): Promise<Observation | undefined>

  createObservations(
    userId: string,
    values: Array<{
      observation: Observation
      loincCode: LoincCode
      collection: UserObservationCollection
    }>,
    reference: FHIRReference | null,
  ): Promise<void>

  // Questionnaire Responses

  getQuestionnaireResponses(
    userId: string,
  ): Promise<Array<Document<FHIRQuestionnaireResponse>>>
  getSymptomScores(
    userId: string,
    options?: { limit?: number },
  ): Promise<Array<Document<SymptomScore>>>
  getLatestSymptomScore(
    userId: string,
  ): Promise<Document<SymptomScore> | undefined>

  updateSymptomScore(
    userId: string,
    symptomScoreId: string,
    symptomScore: SymptomScore | null,
  ): Promise<void>

  // Share Code

  createShareCode(userId: string): Promise<Document<UserShareCode>>
  validateShareCode(
    userId: string,
    documentId: string,
    code: string,
  ): Promise<boolean>
}
