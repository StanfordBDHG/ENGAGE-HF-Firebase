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
import {
  type FHIRMedication,
  type FHIRMedicationRequest,
} from '../../models/fhir/medication.js'
import { type FHIRObservation } from '../../models/fhir/observation.js'
import { type Invitation } from '../../models/invitation.js'
import { type KccqScore } from '../../models/kccqScore.js'
import { type MedicationClass } from '../../models/medicationClass.js'
import { type UserMessage } from '../../models/message.js'
import { type Organization } from '../../models/organization.js'
import { type Clinician, type Patient, type User } from '../../models/user.js'

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
    const invitationData = invitation.data() as Invitation | undefined

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

    await this.auth.updateUser(userId, {
      displayName: invitationData?.auth?.displayName,
      email: invitationData?.auth?.email,
      photoURL: invitationData?.auth?.photoURL,
    })

    // eslint-disable-next-line @typescript-eslint/require-await
    await this.firestore.runTransaction(async (transaction: Transaction) => {
      transaction.create(userRef, {
        invitationCode: invitation.id,
        dateOfEnrollment: FieldValue.serverTimestamp(),
        ...invitationData?.user,
      })

      if (invitationData?.admin) {
        const adminRef = this.firestore.doc(`admins/${userId}`)
        transaction.create(adminRef, invitationData.admin)
      }

      if (invitationData?.clinician) {
        const clinicianRef = this.firestore.doc(`clinicians/${userId}`)
        transaction.create(clinicianRef, invitationData.clinician)
      }

      if (invitationData?.patient) {
        const patientRef = this.firestore.doc(`patients/${userId}`)
        transaction.create(patientRef, invitationData.patient)
      }

      transaction.set(invitationRef, {
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

  // Organizations

  getOrganizations() {
    return this.getCollection<Organization>('organizations')
  }

  async getOrganization(organizationId: string) {
    return this.getDocument<Organization>(`organizations/${organizationId}`)
  }

  // Users

  async getClinician(userId: string) {
    return this.getDocument<Clinician>(`clinicians/${userId}`)
  }

  async getUser(userId: string) {
    return this.getDocument<User>(`users/${userId}`)
  }

  async getPatient(userId: string) {
    return this.getDocument<Patient>(`patients/${userId}`)
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

  async dismissMessage(
    userId: string,
    messageId: string,
    didPerformAction: boolean,
  ): Promise<void> {
    console.log(
      `dismissMessage for user/${userId}/message/${messageId} with didPerformAction ${didPerformAction}`,
    )
    await this.firestore.runTransaction(async (transaction) => {
      const messageRef = this.firestore.doc(
        `users/${userId}/messages/${messageId}`,
      )
      const message = await transaction.get(messageRef)
      if (!message.exists)
        throw new https.HttpsError('not-found', 'Message not found.')

      const messageContent = message.data() as UserMessage
      if (!messageContent.isDismissible)
        throw new https.HttpsError(
          'invalid-argument',
          'Message is not dismissible.',
        )

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
