//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type PatientService } from './patientService.js'
import { advanceDateByDays } from '../../extensions/date.js'
import { type FHIRAllergyIntolerance } from '../../models/fhir/allergyIntolerance.js'
import { type FHIRAppointment } from '../../models/fhir/appointment.js'
import { type FHIRMedicationRequest } from '../../models/fhir/medication.js'
import { type FHIRObservation } from '../../models/fhir/observation.js'
import { type FHIRQuestionnaireResponse } from '../../models/fhir/questionnaireResponse.js'
import {
  MedicationRecommendationType,
  type MedicationRecommendation,
} from '../../models/medicationRecommendation.js'
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

  async getEveryAppoinment(
    fromDate: Date,
    toDate: Date,
  ): Promise<Array<Document<FHIRAppointment>>> {
    const result = await this.databaseService.getQuery<FHIRAppointment>(
      (firestore) =>
        firestore
          .collectionGroup('appointments')
          .where('start', '>', advanceDateByDays(fromDate, -1).toISOString())
          .where('start', '<', advanceDateByDays(toDate, 1).toISOString()),
    )

    return result.filter((appointment) => {
      const start = new Date(appointment.content.start)
      return start >= fromDate && start < toDate
    })
  }

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
    const result =
      await this.databaseService.getCollection<MedicationRecommendation>(
        `users/${userId}/medicationRecommendations`,
      )

    return result.sort(
      (a, b) =>
        this.priorityForRecommendationType(a.content.displayInformation.type) -
        this.priorityForRecommendationType(b.content.displayInformation.type),
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
    cutoffDate: Date,
  ): Promise<Array<Document<FHIRObservation>>> {
    return this.databaseService.getQuery<FHIRObservation>((firestore) =>
      firestore
        .collection(`users/${userId}/bloodPressureObservations`)
        .where('effectiveDateTime', '>', cutoffDate.toISOString())
        .orderBy('effectiveDateTime', 'desc'),
    )
  }

  async getBodyWeightObservations(
    userId: string,
    cutoffDate: Date,
  ): Promise<Array<Document<FHIRObservation>>> {
    return this.databaseService.getQuery<FHIRObservation>((firestore) =>
      firestore
        .collection(`users/${userId}/bodyWeightObservations`)
        .where('effectiveDateTime', '>', cutoffDate.toISOString())
        .orderBy('effectiveDateTime', 'desc'),
    )
  }

  async getHeartRateObservations(
    userId: string,
    cutoffDate: Date,
  ): Promise<Array<Document<FHIRObservation>>> {
    return this.databaseService.getQuery<FHIRObservation>((firestore) =>
      firestore
        .collection(`users/${userId}/heartRateObservations`)
        .where('effectiveDateTime', '>', cutoffDate.toISOString())
        .orderBy('effectiveDateTime', 'desc'),
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
    limit: number | null,
  ): Promise<Array<Document<SymptomScore>>> {
    return this.databaseService.getQuery<SymptomScore>((firestore) => {
      const query = firestore
        .collection(`users/${userId}/symptomScores`)
        .orderBy('date', 'desc')
      return limit ? query.limit(limit) : query
    })
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

  // Helpers

  private priorityForRecommendationType(
    type: MedicationRecommendationType,
  ): number {
    switch (type) {
      case MedicationRecommendationType.improvementAvailable:
        return 1
      case MedicationRecommendationType.morePatientObservationsRequired:
        return 2
      case MedicationRecommendationType.moreLabObservationsRequired:
        return 3
      case MedicationRecommendationType.personalTargetDoseReached:
        return 4
      case MedicationRecommendationType.targetDoseReached:
        return 5
      case MedicationRecommendationType.notStarted:
        return 6
      case MedicationRecommendationType.noActionRequired:
        return 7
    }
  }
}
