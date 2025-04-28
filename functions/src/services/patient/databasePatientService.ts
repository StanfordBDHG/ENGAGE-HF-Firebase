//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { isDeepStrictEqual } from 'util'
import {
  advanceDateByDays,
  advanceDateByMinutes,
  compactMap,
  type FHIRAllergyIntolerance,
  type FHIRAppointment,
  type FHIRMedicationRequest,
  FHIRObservation,
  type FHIRQuestionnaireResponse,
  LoincCode,
  type Observation,
  QuantityUnit,
  type SymptomScore,
  type UserMedicationRecommendation,
  UserMedicationRecommendationType,
  UserObservationCollection,
  type UserShareCode,
} from '@stanfordbdhg/engagehf-models'
import {
  FieldValue,
  type QueryDocumentSnapshot,
  type Transaction,
} from 'firebase-admin/firestore'
import { type PatientService } from './patientService.js'
import { type CollectionsService } from '../database/collections.js'
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
  ): Promise<Document<FHIRAppointment>[]> {
    const result = await this.databaseService.getQuery<FHIRAppointment>(
      (collections) =>
        collections.appointments
          .where('start', '>', advanceDateByDays(fromDate, -1).toISOString())
          .where('start', '<', advanceDateByDays(toDate, 1).toISOString()),
    )

    return result.filter((appointment) => {
      const start = new Date(appointment.content.start)
      return start >= fromDate && start < toDate
    })
  }

  async getAppointments(userId: string): Promise<Document<FHIRAppointment>[]> {
    return this.databaseService.getQuery<FHIRAppointment>((collections) =>
      collections.userAppointments(userId),
    )
  }

  async getNextAppointment(
    userId: string,
  ): Promise<Document<FHIRAppointment> | undefined> {
    const result = await this.databaseService.getQuery<FHIRAppointment>(
      (collections) =>
        collections
          .userAppointments(userId)
          .where('start', '>', new Date().toISOString())
          .orderBy('start', 'asc')
          .limit(1),
    )
    return result.at(0)
  }

  // Methods - Contraindications

  async getContraindications(
    userId: string,
  ): Promise<Document<FHIRAllergyIntolerance>[]> {
    return this.databaseService.getQuery<FHIRAllergyIntolerance>(
      (collections) => collections.userAllergyIntolerances(userId),
    )
  }

  // Methods - Medication Requests

  async getMedicationRequests(
    userId: string,
  ): Promise<Document<FHIRMedicationRequest>[]> {
    return this.databaseService.getQuery<FHIRMedicationRequest>((collections) =>
      collections.userMedicationRequests(userId),
    )
  }

  async updateMedicationRequests(
    userId: string,
    values: FHIRMedicationRequest[],
  ): Promise<void> {
    // TODO: Check this entire section!!!!!!!!
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        const collection = collections.userMedicationRequests(userId)
        const existingSnapshot = await transaction.get(collection)
        const indicesToBeInserted = new Set<number>(
          values.map((_, index) => index),
        )
        for (const existing of existingSnapshot.docs) {
          const existingRequest = existing.data()

          const newRequestIndex = values.findIndex(
            (request) =>
              request.medicationReference?.reference ===
              existingRequest.medicationReference?.reference,
          )

          if (newRequestIndex < 0) {
            transaction.delete(existing.ref)
            continue
          }
          const newRequest = values[newRequestIndex]
          indicesToBeInserted.delete(newRequestIndex)

          if (!isDeepStrictEqual(newRequest, existingRequest))
            transaction.set(existing.ref, newRequest)
        }
        indicesToBeInserted.forEach((newRequestIndex) => {
          transaction.set(collection.doc(), values[newRequestIndex])
        })
      },
    )
  }

  async getMedicationRecommendations(
    userId: string,
  ): Promise<Document<UserMedicationRecommendation>[]> {
    const result =
      await this.databaseService.getQuery<UserMedicationRecommendation>(
        (collections) => collections.userMedicationRecommendations(userId),
      )

    return result.sort((a, b) => {
      const priorityDiff =
        this.priorityForRecommendationType(a.content.displayInformation.type) -
        this.priorityForRecommendationType(b.content.displayInformation.type)
      if (priorityDiff !== 0) return priorityDiff

      const medicationClassA = a.content.displayInformation.subtitle.localize()
      const medicationClassB = b.content.displayInformation.subtitle.localize()
      return medicationClassA.localeCompare(medicationClassB, 'en')
    })
  }

  async updateMedicationRecommendations(
    userId: string,
    newRecommendations: UserMedicationRecommendation[],
  ): Promise<void> {
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        const collection = collections.userMedicationRecommendations(userId)
        const existingSnapshot = await transaction.get(collection)
        const indicesToBeInserted = new Set<number>(
          newRecommendations.map((_, index) => index),
        )
        for (const existing of existingSnapshot.docs) {
          const existingRecommendation = existing.data()

          const newRecommendationIndex = newRecommendations.findIndex(
            (recommendation) =>
              recommendation.displayInformation.title ===
              existingRecommendation.displayInformation.title,
          )

          if (newRecommendationIndex < 0) {
            transaction.delete(existing.ref)
            continue
          }
          const newRecommendation = newRecommendations[newRecommendationIndex]
          indicesToBeInserted.delete(newRecommendationIndex)

          if (!isDeepStrictEqual(newRecommendation, existingRecommendation))
            transaction.set(existing.ref, newRecommendation)
        }
        indicesToBeInserted.forEach((newRecommendationIndex) => {
          transaction.set(
            collection.doc(),
            newRecommendations[newRecommendationIndex],
          )
        })
      },
    )
  }

  // Methods - Observations

  async getBloodPressureObservations(
    userId: string,
    cutoffDate: Date,
  ): Promise<[Observation[], Observation[]]> {
    const observations = await this.databaseService.getQuery<FHIRObservation>(
      (collections) =>
        collections
          .userObservations(userId, UserObservationCollection.bloodPressure)
          .where('effectiveDateTime', '>', cutoffDate.toISOString())
          .orderBy('effectiveDateTime', 'desc'),
    )
    return [
      compactMap(
        observations,
        (observation) => observation.content.systolicBloodPressure,
      ),
      compactMap(
        observations,
        (observation) => observation.content.diastolicBloodPressure,
      ),
    ]
  }

  async getBodyWeightObservations(
    userId: string,
    unit: QuantityUnit,
    cutoffDate: Date,
  ): Promise<Observation[]> {
    const observations = await this.databaseService.getQuery<FHIRObservation>(
      (collections) =>
        collections
          .userObservations(userId, UserObservationCollection.bodyWeight)
          .where('effectiveDateTime', '>', cutoffDate.toISOString())
          .orderBy('effectiveDateTime', 'desc'),
    )
    return compactMap(observations, (observation) =>
      observation.content.bodyWeight(unit),
    )
  }

  async getHeartRateObservations(
    userId: string,
    cutoffDate: Date,
  ): Promise<Observation[]> {
    const observations = await this.databaseService.getQuery<FHIRObservation>(
      (collections) =>
        collections
          .userObservations(userId, UserObservationCollection.heartRate)
          .where('effectiveDateTime', '>', cutoffDate.toISOString())
          .orderBy('effectiveDateTime', 'desc'),
    )
    return compactMap(
      observations,
      (observation) => observation.content.heartRate,
    )
  }

  async getMostRecentCreatinineObservation(
    userId: string,
  ): Promise<Observation | undefined> {
    const result = await this.databaseService.getQuery<FHIRObservation>(
      (collections) =>
        collections
          .userObservations(userId, UserObservationCollection.creatinine)
          .orderBy('effectiveDateTime', 'desc')
          .limit(1),
    )
    return result.at(0)?.content.creatinine
  }

  async getMostRecentDryWeightObservation(
    userId: string,
  ): Promise<Observation | undefined> {
    const result = await this.databaseService.getQuery<FHIRObservation>(
      (collections) =>
        collections
          .userObservations(userId, UserObservationCollection.dryWeight)
          .orderBy('effectiveDateTime', 'desc')
          .limit(1),
    )
    return result.at(0)?.content.bodyWeight(QuantityUnit.lbs)
  }

  async getMostRecentEstimatedGlomerularFiltrationRateObservation(
    userId: string,
  ): Promise<Observation | undefined> {
    const result = await this.databaseService.getQuery<FHIRObservation>(
      (collections) =>
        collections
          .userObservations(userId, UserObservationCollection.eGfr)
          .orderBy('effectiveDateTime', 'desc')
          .limit(1),
    )
    return result.at(0)?.content.estimatedGlomerularFiltrationRate
  }

  async getMostRecentPotassiumObservation(
    userId: string,
  ): Promise<Observation | undefined> {
    const result = await this.databaseService.getQuery<FHIRObservation>(
      (collections) =>
        collections
          .userObservations(userId, UserObservationCollection.potassium)
          .orderBy('effectiveDateTime', 'desc')
          .limit(1),
    )
    return result.at(0)?.content.potassium
  }

  async createObservations(
    userId: string,
    values: {
      observation: Observation
      loincCode: LoincCode
      collection: UserObservationCollection
    }[],
  ): Promise<void> {
    this.databaseService.runTransaction((collections, transaction) => {
      for (const value of values) {
        const ref = collections.userObservations(userId, value.collection).doc()
        const fhirObservation = FHIRObservation.createSimple({
          id: ref.id,
          date: value.observation.date,
          value: value.observation.value,
          unit: value.observation.unit,
          code: value.loincCode,
        })
        transaction.set(ref, fhirObservation)
      }
    })
  }

  // Methods - Questionnaire Responses

  async getQuestionnaireResponses(
    userId: string,
  ): Promise<Document<FHIRQuestionnaireResponse>[]> {
    return this.databaseService.getQuery<FHIRQuestionnaireResponse>(
      (collections) => collections.userQuestionnaireResponses(userId),
    )
  }

  async getSymptomScores(
    userId: string,
    options?: { limit?: number },
  ): Promise<Document<SymptomScore>[]> {
    return this.databaseService.getQuery<SymptomScore>((collections) => {
      const query = collections
        .userSymptomScores(userId)
        .orderBy('date', 'desc')
      return options?.limit ? query.limit(options.limit) : query
    })
  }

  async getLatestSymptomScore(
    userId: string,
  ): Promise<Document<SymptomScore> | undefined> {
    const result = await this.databaseService.getQuery<SymptomScore>(
      (collections) =>
        collections.userSymptomScores(userId).orderBy('date', 'desc').limit(1),
    )
    return result.at(0)
  }

  async updateSymptomScore(
    userId: string,
    symptomScoreId: string,
    symptomScore: SymptomScore | null,
  ): Promise<void> {
    return this.databaseService.runTransaction((collections, transaction) => {
      const ref = collections.userSymptomScores(userId).doc(symptomScoreId)
      if (symptomScore !== null) {
        transaction.set(ref, symptomScore)
      } else {
        transaction.delete(ref)
      }
    })
  }

  // Helpers

  private priorityForRecommendationType(
    type: UserMedicationRecommendationType,
  ): number {
    switch (type) {
      case UserMedicationRecommendationType.improvementAvailable:
        return 1
      case UserMedicationRecommendationType.morePatientObservationsRequired:
        return 2
      case UserMedicationRecommendationType.moreLabObservationsRequired:
        return 3
      case UserMedicationRecommendationType.personalTargetDoseReached:
        return 4
      case UserMedicationRecommendationType.targetDoseReached:
        return 5
      case UserMedicationRecommendationType.notStarted:
        return 6
      case UserMedicationRecommendationType.noActionRequired:
        return 7
    }
  }

  // Share Code

  async createShareCode(userId: string): Promise<Document<UserShareCode>> {
    const now = new Date()
    const object: UserShareCode = {
      code: Math.random().toString(36).substring(2, 6),
      tries: 3,
      expiresAt: advanceDateByMinutes(now, 5),
    }

    const ref = await this.runShareCodeTransaction(
      userId,
      now,
      (collections, transaction) => {
        const ref = collections.userShareCodes(userId).doc()
        transaction.create(ref, object)
        return ref
      },
    )

    return {
      id: ref.id,
      path: ref.path,
      lastUpdate: now,
      content: object,
    }
  }

  async validateShareCode(
    userId: string,
    documentId: string,
    code: string,
  ): Promise<boolean> {
    const now = new Date()

    return this.runShareCodeTransaction(userId, now, (_, transaction, docs) => {
      const shareCodeDoc = docs.find((doc) => doc.id === documentId)
      if (shareCodeDoc === undefined) return false
      const shareCodeData = shareCodeDoc.data()
      if (shareCodeData.code.toLowerCase() !== code.toLowerCase()) {
        if (shareCodeData.tries > 1) {
          transaction.update(
            shareCodeDoc.ref,
            'tries',
            FieldValue.increment(-1),
          )
        } else {
          transaction.delete(shareCodeDoc.ref)
        }
        return false
      }
      return true
    })
  }

  private async runShareCodeTransaction<T>(
    userId: string,
    now: Date,
    perform: (
      collections: CollectionsService,
      transaction: Transaction,
      codes: QueryDocumentSnapshot<UserShareCode>[],
    ) => Promise<T> | T,
  ): Promise<T> {
    return this.databaseService.runTransaction(
      async (collections, transaction) => {
        const existingCodes = await collections.userShareCodes(userId).get()
        const nonExpiredCodes: QueryDocumentSnapshot<UserShareCode>[] = []

        for (const existingDoc of existingCodes.docs) {
          const existingCode = existingDoc.data()
          if (existingCode.expiresAt < now) {
            transaction.delete(existingDoc.ref)
          } else {
            nonExpiredCodes.push(existingDoc)
          }
        }

        return perform(collections, transaction, nonExpiredCodes)
      },
    )
  }
}
