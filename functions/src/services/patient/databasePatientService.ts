//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type PatientService } from './patientService.js'
import { type FHIRAllergyIntolerance } from '../../models/fhir/allergyIntolerance.js'
import { type FHIRAppointment } from '../../models/fhir/appointment.js'
import { type FHIRMedicationRequest } from '../../models/fhir/medication.js'
import { type FHIRObservation } from '../../models/fhir/observation.js'
import { type FHIRQuestionnaireResponse } from '../../models/fhir/questionnaireResponse.js'
import { type MedicationRecommendation } from '../../models/medicationRecommendation.js'
import { type SymptomScore } from '../../models/symptomScore.js'
import {
  type Document,
  type DatabaseService,
} from '../database/databaseService.js'

export class DatabasePatientService implements PatientService {
  // Properties

  private databaseService: DatabaseService

  // Constructor

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService
  }

  // Methods - Appointments

  async getAppointments(
    userId: string,
  ): Promise<Array<Document<FHIRAppointment>>> {
    return this.databaseService.getCollection<FHIRAppointment>(
      `patients/${userId}/appointments`,
    )
  }

  async getNextAppointment(
    userId: string,
  ): Promise<Document<FHIRAppointment> | undefined> {
    const result = await this.databaseService.getQuery<FHIRAppointment>(
      (firestore) =>
        firestore
          .collection(`patients/${userId}/appointments`)
          .where('start', '>', new Date())
          .orderBy('start', 'asc')
          .limit(1),
    )
    return result.at(0)
  }

  // Methods - AllergyIntolerances

  async getAllergyIntolerances(
    userId: string,
  ): Promise<Array<Document<FHIRAllergyIntolerance>>> {
    return this.databaseService.getCollection<FHIRAllergyIntolerance>(
      `patients/${userId}/allergyIntolerances`,
    )
  }

  // Methods - Medication Requests

  async getMedicationRecommendations(
    userId: string,
  ): Promise<Array<Document<MedicationRecommendation>>> {
    return this.databaseService.getCollection<MedicationRecommendation>(
      `patients/${userId}/medicationRecommendations`,
    )
  }

  async getMedicationRequests(
    userId: string,
  ): Promise<Array<Document<FHIRMedicationRequest>>> {
    return this.databaseService.getCollection<FHIRMedicationRequest>(
      `patients/${userId}/medicationRequests`,
    )
  }

  // Methods - Observations

  async getBloodPressureObservations(
    userId: string,
  ): Promise<Array<Document<FHIRObservation>>> {
    return this.databaseService.getCollection<FHIRObservation>(
      `patients/${userId}/bloodPressureObservations`,
    )
  }

  async getBodyWeightObservations(
    userId: string,
  ): Promise<Array<Document<FHIRObservation>>> {
    return this.databaseService.getCollection<FHIRObservation>(
      `patients/${userId}/bodyWeightObservations`,
    )
  }

  async getHeartRateObservations(
    userId: string,
  ): Promise<Array<Document<FHIRObservation>>> {
    return this.databaseService.getCollection<FHIRObservation>(
      `patients/${userId}/heartRateObservations`,
    )
  }

  async getMostRecentCreatinineObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined> {
    const result = await this.databaseService.getQuery<FHIRObservation>(
      (firestore) =>
        firestore
          .collection(`patients/${userId}/creatinineObservations`)
          .orderBy('effectiveDateTime', 'desc')
          .limit(1),
    )
    return result.at(0)
  }

  async getMostRecentDryWeightObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined> {
    const result = await this.databaseService.getQuery<FHIRObservation>(
      (firestore) =>
        firestore
          .collection(`patients/${userId}/dryWeightObservations`)
          .orderBy('effectiveDateTime', 'desc')
          .limit(1),
    )
    return result.at(0)
  }

  async getMostRecentEstimatedGlomerularFiltrationRateObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined> {
    const result = await this.databaseService.getQuery<FHIRObservation>(
      (firestore) =>
        firestore
          .collection(`patients/${userId}/eGfrObservations`)
          .orderBy('effectiveDateTime', 'desc')
          .limit(1),
    )
    return result.at(0)
  }

  async getMostRecentPotassiumObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined> {
    const result = await this.databaseService.getQuery<FHIRObservation>(
      (firestore) =>
        firestore
          .collection(`patients/${userId}/potassiumObservations`)
          .orderBy('effectiveDateTime', 'desc')
          .limit(1),
    )
    return result.at(0)
  }

  // Methods - Questionnaire Responses

  async getQuestionnaireResponses(
    userId: string,
  ): Promise<Array<Document<FHIRQuestionnaireResponse>>> {
    return this.databaseService.getCollection<FHIRQuestionnaireResponse>(
      `patients/${userId}/questionnaireResponses`,
    )
  }

  async getSymptomScores(
    userId: string,
  ): Promise<Array<Document<SymptomScore>>> {
    return this.databaseService.getCollection<SymptomScore>(
      `patients/${userId}/symptomScores`,
    )
  }
}
