//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import admin from 'firebase-admin'
import { type Auth } from 'firebase-admin/auth'
import { FieldValue } from 'firebase-admin/firestore'
import { https } from 'firebase-functions/v2'
import { type UserService } from './userService.js'
import { type Invitation } from '../../models/invitation.js'
import { type UserMessage } from '../../models/message.js'
import { type Organization } from '../../models/organization.js'
import {
  type UserAuth,
  type Clinician,
  type Patient,
  type User,
} from '../../models/user.js'
import {
  type Document,
  type DatabaseService,
} from '../database/databaseService.js'

export class DatabaseUserService implements UserService {
  // Properties

  private readonly auth: Auth
  private readonly databaseService: DatabaseService

  // Constructor

  constructor(databaseService: DatabaseService, auth: Auth = admin.auth()) {
    this.auth = auth
    this.databaseService = databaseService
  }

  // Auth

  async getAuth(userId: string): Promise<UserAuth> {
    const authUser = await this.auth.getUser(userId)
    return {
      displayName: authUser.displayName,
      email: authUser.email,
      phoneNumber: authUser.phoneNumber,
      photoURL: authUser.photoURL,
    }
  }

  async updateAuth(userId: string, auth: UserAuth): Promise<void> {
    await this.auth.updateUser(userId, {
      displayName: auth.displayName,
      email: auth.email,
      phoneNumber: auth.phoneNumber,
      photoURL: auth.photoURL,
    })
  }

  // Invitations

  async getInvitation(
    invitationId: string,
  ): Promise<Document<Invitation> | undefined> {
    return this.databaseService.getDocument<Invitation>(
      `invitations/${invitationId}`,
    )
  }

  async setInvitationUserId(
    invitationId: string,
    userId: string,
  ): Promise<void> {
    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        const invitationRef = firestore.doc(`invitations/${invitationId}`)
        const invitationDoc = await transaction.get(invitationRef)
        if (!invitationDoc.exists) {
          throw new Error('Invitation not found')
        }
        transaction.update(invitationRef, { userId: userId })
      },
    )
  }

  async getInvitationByUserId(
    userId: string,
  ): Promise<Document<Invitation> | undefined> {
    const result = await this.databaseService.getQuery<Invitation>(
      (firestore) =>
        firestore
          .collection('invitations')
          .where('userId', '==', userId)
          .limit(1),
    )
    return result.at(0)
  }

  async enrollUser(
    invitation: Document<Invitation>,
    userId: string,
  ): Promise<void> {
    const user = await this.databaseService.getDocument(`users/${userId}`)
    if (user?.content)
      throw new https.HttpsError(
        'already-exists',
        'User is already enrolled in the study.',
      )

    await this.auth.updateUser(userId, {
      displayName: invitation.content.auth?.displayName,
      email: invitation.content.auth?.email,
      phoneNumber: invitation.content.auth?.phoneNumber,
      photoURL: invitation.content.auth?.photoURL,
    })

    await this.databaseService.runTransaction((firestore, transaction) => {
      transaction.create(firestore.doc(`users/${userId}`), {
        invitationCode: invitation.id,
        dateOfEnrollment: FieldValue.serverTimestamp(),
        ...invitation.content.user,
      })

      if (invitation.content.admin) {
        const adminRef = firestore.doc(`admins/${userId}`)
        transaction.create(adminRef, invitation.content.admin)
      }

      if (invitation.content.clinician) {
        const clinicianRef = firestore.doc(`clinicians/${userId}`)
        transaction.create(clinicianRef, invitation.content.clinician)
      }

      if (invitation.content.patient) {
        const patientRef = firestore.doc(`patients/${userId}`)
        transaction.create(patientRef, invitation.content.patient)
      }

      transaction.delete(firestore.doc(`invitations/${invitation.id}`))
    })
  }

  // Organizations

  async getOrganizations(): Promise<Array<Document<Organization>>> {
    return this.databaseService.getCollection<Organization>('organizations')
  }

  async getOrganization(
    organizationId: string,
  ): Promise<Document<Organization> | undefined> {
    return this.databaseService.getDocument<Organization>(
      `organizations/${organizationId}`,
    )
  }

  // Users

  async getClinician(userId: string): Promise<Document<Clinician> | undefined> {
    return this.databaseService.getDocument<Clinician>(`clinicians/${userId}`)
  }

  async getPatient(userId: string): Promise<Document<Patient> | undefined> {
    return this.databaseService.getDocument<Patient>(`patients/${userId}`)
  }

  async getUser(userId: string): Promise<Document<User> | undefined> {
    return this.databaseService.getDocument<User>(`users/${userId}`)
  }

  async deleteUser(userId: string): Promise<void> {
    await this.databaseService.bulkWrite(async (firestore, writer) => {
      await Promise.all([
        firestore.recursiveDelete(firestore.doc(`admins/${userId}`), writer),
        firestore.recursiveDelete(
          firestore.doc(`clinicians/${userId}`),
          writer,
        ),
        firestore.recursiveDelete(firestore.doc(`patients/${userId}`), writer),
        firestore.recursiveDelete(firestore.doc(`users/${userId}`), writer),
      ])
      await this.auth.deleteUser(userId)
    })
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
    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        const messageRef = firestore.doc(
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
      },
    )
  }
}
