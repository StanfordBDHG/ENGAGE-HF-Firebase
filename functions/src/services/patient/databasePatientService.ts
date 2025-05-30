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
  type FHIRReference,
  type LoincCode,
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
  type ReplaceDiff,
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

  async getAppointments(
    userId: string,
  ): Promise<Array<Document<FHIRAppointment>>> {
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

  async createAppointment(
    userId: string,
    appointment: FHIRAppointment,
  ): Promise<void> {
    await this.databaseService.runTransaction((collections, transaction) => {
      const ref = collections.userAppointments(userId).doc()
      transaction.set(ref, appointment)
    })
  }

  // Methods - Contraindications

  async getContraindications(
    userId: string,
  ): Promise<Array<Document<FHIRAllergyIntolerance>>> {
    return this.databaseService.getQuery<FHIRAllergyIntolerance>(
      (collections) => collections.userAllergyIntolerances(userId),
    )
  }

  // Methods - Medication Requests

  async getMedicationRequests(
    userId: string,
  ): Promise<Array<Document<FHIRMedicationRequest>>> {
    return this.databaseService.getQuery<FHIRMedicationRequest>((collections) =>
      collections.userMedicationRequests(userId),
    )
  }

  async replaceMedicationRequests(
    userId: string,
    values: FHIRMedicationRequest[],
  ): Promise<void> {
    await this.databaseService.replaceCollection(
      (collections) => collections.userMedicationRequests(userId),
      (documents) => {
        const diffs: Array<ReplaceDiff<FHIRMedicationRequest>> = []

        for (const value of values) {
          // We are assuming here that there will only ever be a single medication request per medicationReference!
          const equivalentDoc = documents.find(
            (doc) =>
              doc.content.medicationReference?.reference ===
              value.medicationReference?.reference,
          )
          if (equivalentDoc === undefined) {
            diffs.push({ successor: value })
          } else if (
            !isDeepStrictEqual(
              equivalentDoc.content.dosageInstruction,
              value.dosageInstruction,
            )
          ) {
            diffs.push({ predecessor: equivalentDoc, successor: value })
          }
        }

        for (const doc of documents) {
          if (!diffs.some((diff) => diff.predecessor?.id === doc.id)) {
            diffs.push({ predecessor: doc })
          }
        }

        return diffs
      },
    )
  }

  async getMedicationRecommendations(
    userId: string,
  ): Promise<Array<Document<UserMedicationRecommendation>>> {
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

  async replaceMedicationRecommendations(
    userId: string,
    newRecommendations: UserMedicationRecommendation[],
  ): Promise<void> {
    await this.databaseService.replaceCollection(
      (collections) => collections.userMedicationRecommendations(userId),
      (documents) => {
        const diffs: Array<ReplaceDiff<UserMedicationRecommendation>> = []

        for (const value of newRecommendations) {
          const equivalentDoc = documents
            .filter(
              (doc) =>
                doc.content.displayInformation.title ===
                value.displayInformation.title,
            )
            .at(0)
          // TODO: We are assuming here that there will only ever be a single medication request per medication!

          if (equivalentDoc === undefined) {
            diffs.push({ successor: value })
          } else if (!isDeepStrictEqual(equivalentDoc.content, value)) {
            diffs.push({ predecessor: equivalentDoc, successor: value })
          }
        }

        for (const doc of documents) {
          if (!diffs.some((diff) => diff.predecessor?.id === doc.id)) {
            diffs.push({ predecessor: doc })
          }
        }

        return diffs
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
    return result.at(0)?.content.dryWeight(QuantityUnit.lbs)
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
    values: Array<{
      observation: Observation
      loincCode: LoincCode
      collection: UserObservationCollection
    }>,
    reference: FHIRReference | null,
  ): Promise<void> {
    await this.databaseService.runTransaction((collections, transaction) => {
      for (const value of values) {
        const ref = collections.userObservations(userId, value.collection).doc()
        const fhirObservation = FHIRObservation.createSimple({
          id: ref.id,
          date: value.observation.date,
          value: value.observation.value,
          unit: value.observation.unit,
          code: value.loincCode,
          derivedFrom: [...(reference !== null ? [reference] : [])],
        })
        transaction.set(ref, fhirObservation)
      }
    })
  }

  // Methods - Questionnaire Responses

  async getQuestionnaireResponses(
    userId: string,
  ): Promise<Array<Document<FHIRQuestionnaireResponse>>> {
    return this.databaseService.getQuery<FHIRQuestionnaireResponse>(
      (collections) => collections.userQuestionnaireResponses(userId),
    )
  }

  async getSymptomScores(
    userId: string,
    options?: { limit?: number },
  ): Promise<Array<Document<SymptomScore>>> {
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
      codes: Array<QueryDocumentSnapshot<UserShareCode>>,
    ) => Promise<T> | T,
  ): Promise<T> {
    return this.databaseService.runTransaction(
      async (collections, transaction) => {
        const existingCodes = await collections.userShareCodes(userId).get()
        const nonExpiredCodes: Array<QueryDocumentSnapshot<UserShareCode>> = []

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
