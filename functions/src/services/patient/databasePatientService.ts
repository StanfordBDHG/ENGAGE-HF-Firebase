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
      `users/${userId}/appointments`,
    )
  }

  async getNextAppointment(
    userId: string,
  ): Promise<Document<FHIRAppointment> | undefined> {
    const result = await this.databaseService.getQuery<FHIRAppointment>(
      (firestore) =>
        firestore
          .collection(`users/${userId}/appointments`)
          .where('start', '>', new Date())
          .orderBy('start', 'asc')
          .limit(1),
    )
    return result.at(0)
  }

  // Methods - Contraindications

  async getContraindications(
    userId: string,
  ): Promise<Array<Document<FHIRAllergyIntolerance>>> {
    return this.databaseService.getCollection<FHIRAllergyIntolerance>(
      `users/${userId}/allergyIntolerances`,
    )
  }

  // Methods - Medication Requests

  async getMedicationRecommendations(
    userId: string,
  ): Promise<Array<Document<MedicationRecommendation>>> {
    return this.databaseService.getCollection<MedicationRecommendation>(
      `users/${userId}/medicationRecommendations`,
    )
  }

  async getMedicationRequests(
    userId: string,
  ): Promise<Array<Document<FHIRMedicationRequest>>> {
    return this.databaseService.getCollection<FHIRMedicationRequest>(
      `users/${userId}/medicationRequests`,
    )
  }

  async updateMedicationRecommendations(
    userId: string,
    recommendations: MedicationRecommendation[],
  ): Promise<void> {
    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        const collection = firestore.collection(
          `users/${userId}/medicationRecommendations`,
        )
        const result = await transaction.get(collection)
        for (const doc of result.docs) {
          transaction.delete(doc.ref)
        }
        for (const recommendation of recommendations) {
          transaction.create(collection.doc(), recommendation)
        }
      },
    )
  }

  // Methods - Observations

  async getBloodPressureObservations(
    userId: string,
  ): Promise<Array<Document<FHIRObservation>>> {
    return this.databaseService.getCollection<FHIRObservation>(
      `users/${userId}/bloodPressureObservations`,
    )
  }

  async getBodyWeightObservations(
    userId: string,
  ): Promise<Array<Document<FHIRObservation>>> {
    return this.databaseService.getCollection<FHIRObservation>(
      `users/${userId}/bodyWeightObservations`,
    )
  }

  async getHeartRateObservations(
    userId: string,
  ): Promise<Array<Document<FHIRObservation>>> {
    return this.databaseService.getCollection<FHIRObservation>(
      `users/${userId}/heartRateObservations`,
    )
  }

  async getMostRecentCreatinineObservation(
    userId: string,
  ): Promise<Document<FHIRObservation> | undefined> {
    const result = await this.databaseService.getQuery<FHIRObservation>(
      (firestore) =>
        firestore
          .collection(`users/${userId}/creatinineObservations`)
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
          .collection(`users/${userId}/dryWeightObservations`)
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
          .collection(`users/${userId}/eGfrObservations`)
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
          .collection(`users/${userId}/potassiumObservations`)
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
      `users/${userId}/questionnaireResponses`,
    )
  }

  async getSymptomScores(
    userId: string,
    cutoffDate: Date,
  ): Promise<Array<Document<SymptomScore>>> {
    return this.databaseService.getQuery<SymptomScore>((firestore) =>
      firestore
        .collection(`users/${userId}/symptomScores`)
        .where('date', '>', cutoffDate)
        .orderBy('date', 'desc'),
    )
  }

  async getLatestSymptomScore(
    userId: string,
  ): Promise<Document<SymptomScore> | undefined> {
    const result = await this.databaseService.getQuery<SymptomScore>(
      (firestore) =>
        firestore
          .collection(`users/${userId}/symptomScores`)
          .orderBy('date', 'desc')
          .limit(1),
    )
    return result.at(0)
  }

  async updateSymptomScore(
    userId: string,
    symptomScoreId: string,
    symptomScore: SymptomScore | undefined,
  ): Promise<void> {
    return this.databaseService.runTransaction((firestore, transaction) => {
      const ref = firestore.doc(
        `users/${userId}/symptomScores/${symptomScoreId}`,
      )
      if (symptomScore) {
        transaction.set(ref, symptomScore)
      } else {
        transaction.delete(ref)
      }
    })
  }
}
