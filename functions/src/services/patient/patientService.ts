//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type FHIRAllergyIntolerance,
  type FHIRAppointment,
  type FHIRMedicationRequest,
  type FHIRObservation,
  type FHIRQuestionnaireResponse,
  type SymptomScore,
  type UserMedicationRecommendation,
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

  // Contraindications

  getContraindications(
    userId: string,
  ): Promise<Array<Document<FHIRAllergyIntolerance>>>

  // Medication Requests

  getMedicationRecommendations(
    userId: string,
  ): Promise<Array<Document<UserMedicationRecommendation>>>
  getMedicationRequests(
    userId: string,
  ): Promise<Array<Document<FHIRMedicationRequest>>>
  updateMedicationRecommendations(
    userId: string,
    recommendations: UserMedicationRecommendation[],
  ): Promise<boolean>

  // Observations

  getBloodPressureObservations(
    userId: string,
    cutoffDate: Date,
  ): Promise<Array<Document<FHIRObservation>>>
  getBodyWeightObservations(
    userId: string,
    cutoffDate: Date,
  ): Promise<Array<Document<FHIRObservation>>>
  getHeartRateObservations(
    userId: string,
    cutoffDate: Date,
  ): Promise<Array<Document<FHIRObservation>>>

  getMostRecentCreatinineObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined>
  getMostRecentDryWeightObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined>
  getMostRecentEstimatedGlomerularFiltrationRateObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined>
  getMostRecentPotassiumObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined>

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
    symptomScore: SymptomScore | undefined,
  ): Promise<void>
}
