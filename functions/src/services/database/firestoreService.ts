//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import admin from 'firebase-admin'
import { type Auth } from 'firebase-admin/auth'
import {
  FieldValue,
  type Firestore,
  type Transaction,
} from 'firebase-admin/firestore'
import { https } from 'firebase-functions'
import {
  type DatabaseDocument,
  type DatabaseService,
} from './databaseService.js'
import { type Appointment } from '../../models/appointment.js'
import { type Clinician } from '../../models/clinician.js'
import {
  type FHIRMedication,
  type FHIRMedicationRequest,
} from '../../models/fhir/medication.js'
import { type FHIRObservation } from '../../models/fhir/observation.js'
import { type Invitation } from '../../models/invitation.js'
import { type KccqScore } from '../../models/kccqScore.js'
import { type MedicationClass } from '../../models/medicationClass.js'
import { type UserMessage, UserMessageType } from '../../models/message.js'
import { type User } from '../../models/user.js'

export class FirestoreService implements DatabaseService {
  // Properties

  private auth: Auth
  private firestore: Firestore

  // Constructor

  constructor() {
    this.auth = admin.auth()
    this.firestore = admin.firestore()
  }

  // Appointments

  async getAppointments(userId: string) {
    return this.getCollection<Appointment>(`users/${userId}/appointments`)
  }

  async getNextAppointment(userId: string) {
    const collection = await this.firestore
      .collection(`users/${userId}/appointments`)
      .where('start', '>', new Date())
      .orderBy('start')
      .limit(1)
      .get()
    if (collection.docs.length === 0) return undefined
    const doc = collection.docs[0]
    return { id: doc.id, content: doc.data() as Appointment }
  }

  // Clinicians

  async getClinician(userId: string) {
    return this.getDocument<Clinician>(`clinicians/${userId}`)
  }

  // Invitations

  async getInvitation(invitationId: string) {
    return this.getDocument<Invitation>(`invitations/${invitationId}`)
  }

  async getInvitationUsedBy(userId: string) {
    const collection = await this.firestore
      .collection('invitations')
      .where('usedBy', '==', userId)
      .limit(1)
      .get()
    if (collection.empty) return undefined
    const doc = collection.docs[0]
    return { id: doc.id, content: doc.data() as Invitation }
  }

  async enrollUser(invitationId: string, userId: string) {
    const invitationRef = this.firestore.doc(`invitations/${invitationId}`)
    const invitation = await invitationRef.get()
    const invitationData = invitation.data()

    if (!invitation.exists || invitationData?.used) {
      throw new https.HttpsError(
        'not-found',
        'Invitation code not found or already used.',
      )
    }

    const userRef = this.firestore.doc(`users/${userId}`)
    const user = await userRef.get()
    if (user.exists) {
      throw new https.HttpsError(
        'already-exists',
        'User is already enrolled in the study.',
      )
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    await this.firestore.runTransaction(async (transaction: Transaction) => {
      transaction.set(userRef, {
        invitationCode: invitation.id,
        dateOfEnrollment: FieldValue.serverTimestamp(),
        ...invitationData?.user,
      })

      transaction.update(invitationRef, {
        used: true,
        usedBy: userId,
      })
    })
  }

  // Medications

  async getMedicationClasses() {
    return this.getCollection<MedicationClass>(`medicationClasses`)
  }

  async getMedicationClass(medicationClassId: string) {
    return this.getDocument<MedicationClass>(
      `medicationClasses/${medicationClassId}`,
    )
  }

  async getMedications() {
    return this.getCollection<FHIRMedication>(`medications`)
  }

  async getMedication(medicationId: string) {
    return this.getDocument<FHIRMedication>(`medications/${medicationId}`)
  }

  async getDrugs(medicationId: string) {
    return this.getCollection<FHIRMedication>(
      `medications/${medicationId}/drugs`,
    )
  }

  async getDrug(medicationId: string, drugId: string) {
    return this.getDocument<FHIRMedication>(
      `medications/${medicationId}/drugs/${drugId}`,
    )
  }

  // Users

  async getUser(userId: string) {
    return this.getDocument<User>(`users/${userId}`)
  }

  async getUserRecord(userId: string) {
    return this.auth.getUser(userId)
  }

  // Users - Medication Requests

  async getMedicationRecommendations(userId: string) {
    return this.getCollection<FHIRMedicationRequest>(
      `users/${userId}/medicationRecommendations`,
    )
  }

  async getMedicationRequests(userId: string) {
    return this.getCollection<FHIRMedicationRequest>(
      `users/${userId}/medicationRequests`,
    )
  }

  // Users - Messages

  async didDismissMessage(
    userId: string,
    messageId: string,
    didPerformAction: boolean,
  ): Promise<void> {
    console.log(
      `didDismissMessage for user/${userId}/message/${messageId} with didPerformAction ${didPerformAction}`,
    )
    await this.firestore.runTransaction(async (transaction) => {
      const messageRef = this.firestore.doc(
        `users/${userId}/messages/${messageId}`,
      )
      const message = await transaction.get(messageRef)
      if (!message.exists)
        throw new https.HttpsError('not-found', 'Message not found.')

      const messageContent = message.data() as UserMessage
      if (!messageContent.isDismissable)
        throw new https.HttpsError('invalid-argument', 'Message is not dismissable.')

      transaction.update(messageRef, {
        completionDate: FieldValue.serverTimestamp(),
      })
    })
  }

  // Users - Observations

  async getBloodPressureObservations(userId: string) {
    return this.getCollection<FHIRObservation>(
      `users/${userId}/bloodPressureObservations`,
    )
  }

  async getBodyWeightObservations(userId: string) {
    return this.getCollection<FHIRObservation>(
      `users/${userId}/bodyWeightObservations`,
    )
  }

  async getHeartRateObservations(userId: string) {
    return this.getCollection<FHIRObservation>(
      `users/${userId}/heartRateObservations`,
    )
  }

  // Users - Questionnaire Responses

  async getKccqScores(userId: string) {
    return this.getCollection<KccqScore>(`users/${userId}/kccqScores`)
  }

  // Helpers

  private async getCollection<T>(
    path: string,
  ): Promise<Array<DatabaseDocument<T>>> {
    const collection = await this.firestore.collection(path).get()
    return collection.docs.map((doc) => ({
      id: doc.id,
      content: doc.data() as T,
    }))
  }

  private async getDocument<T>(path: string): Promise<DatabaseDocument<T>> {
    const doc = await this.firestore.doc(path).get()
    return { id: doc.id, content: doc.data() as T | undefined }
  }
}
