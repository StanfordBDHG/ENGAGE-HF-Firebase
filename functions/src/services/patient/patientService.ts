//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type FHIRAllergyIntolerance } from '../../models/fhir/allergyIntolerance.js'
import { type FHIRAppointment } from '../../models/fhir/appointment.js'
import { type FHIRMedicationRequest } from '../../models/fhir/medication.js'
import { type FHIRObservation } from '../../models/fhir/observation.js'
import { type FHIRQuestionnaireResponse } from '../../models/fhir/questionnaireResponse.js'
import { type MedicationRecommendation } from '../../models/medicationRecommendation.js'
import { type SymptomScore } from '../../models/symptomScore.js'
import { type Document } from '../database/databaseService.js'

export interface PatientService {
  // Appointments

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
  ): Promise<Array<Document<MedicationRecommendation>>>
  getMedicationRequests(
    userId: string,
  ): Promise<Array<Document<FHIRMedicationRequest>>>
  updateMedicationRecommendations(
    userId: string,
    recommendations: MedicationRecommendation[],
  ): Promise<void>

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
    cutoffDate: Date,
  ): Promise<Array<Document<SymptomScore>>>
  getLatestSymptomScore(
    userId: string,
  ): Promise<Document<SymptomScore> | undefined>
}
