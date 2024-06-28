import admin from 'firebase-admin'
import { type Auth } from 'firebase-admin/auth'
import {
  FieldValue,
  type Firestore,
  type Transaction,
} from 'firebase-admin/firestore'
import { https } from 'firebase-functions'
import { type Appointment } from '../models/appointment'
import { type Clinician } from '../models/clinician'
import { type FHIRObservation } from '../models/fhir/observation'
import { type Invitation } from '../models/invitation'
import { type KccqScore } from '../models/kccqScore'
import { type User } from '../models/user'

export interface FirebaseDocument<Content> {
  id: string
  content: Content | undefined
}

export class FirebaseService {
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

    if (!invitation.exists || invitation.data()?.used) {
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
      })

      transaction.update(invitationRef, {
        used: true,
        usedBy: userId,
      })
    })
  }

  // Users

  async getUser(userId: string) {
    return this.getDocument<User>(`users/${userId}`)
  }

  async getUserRecord(userId: string) {
    return this.auth.getUser(userId)
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
  ): Promise<Array<FirebaseDocument<T>>> {
    const collection = await this.firestore.collection(path).get()
    return collection.docs.map((doc) => ({
      id: doc.id,
      content: doc.data() as T,
    }))
  }

  private async getDocument<T>(path: string): Promise<FirebaseDocument<T>> {
    const doc = await this.firestore.doc(path).get()
    return { id: doc.id, content: doc.data() as T | undefined }
  }
}
