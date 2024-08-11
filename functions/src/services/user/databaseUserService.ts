//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type Auth } from 'firebase-admin/auth'
import { FieldValue } from 'firebase-admin/firestore'
import { https } from 'firebase-functions/v2'
import { type UserService } from './userService.js'
import { type Invitation } from '../../models/invitation.js'
import { type UserMessage } from '../../models/message.js'
import { type Organization } from '../../models/organization.js'
import { UserType, type UserAuth, type User } from '../../models/user.js'
import {
  type Document,
  type DatabaseService,
} from '../database/databaseService.js'

export interface UserClaims {
  type: UserType
  organization: string | null
}

export class DatabaseUserService implements UserService {
  // Properties

  private readonly auth: Auth
  private readonly databaseService: DatabaseService

  // Constructor

  constructor(auth: Auth, databaseService: DatabaseService) {
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

  async updateClaims(userId: string): Promise<void> {
    const user = await this.getUser(userId)
    if (!user) throw new https.HttpsError('not-found', 'User not found.')

    await this.auth.setCustomUserClaims(userId, {
      type: user.content.type,
      organization: user.content.organization ?? null,
    })
  }

  // Invitations

  async createInvitation(content: Invitation): Promise<{ id: string }> {
    const id = await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        const invitations = await transaction.get(
          firestore
            .collection('invitations')
            .where('code', '==', content.code)
            .limit(1),
        )
        if (!invitations.empty)
          throw new https.HttpsError(
            'invalid-argument',
            'Invitation code is not unique.',
          )
        const invitationDoc = firestore.collection(`invitations`).doc()
        transaction.create(invitationDoc, content)
        return invitationDoc.id
      },
    )
    return { id }
  }

  async getInvitationByCode(
    invitationCode: string,
  ): Promise<Document<Invitation> | undefined> {
    const result = await this.databaseService.getQuery<Invitation>(
      (firestore) =>
        firestore
          .collection('invitations')
          .where('code', '==', invitationCode)
          .limit(1),
    )
    return result.at(0)
  }

  async setInvitationUserId(
    invitationCode: string,
    userId: string,
  ): Promise<void> {
    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        const invitation = (
          await firestore
            .collection(`invitations`)
            .where('code', '==', invitationCode)
            .limit(1)
            .get()
        ).docs.at(0)
        if (!invitation) throw new Error('Invitation not found')
        transaction.update(invitation.ref, { userId: userId })
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

    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        transaction.create(firestore.doc(`users/${userId}`), {
          ...invitation.content.user,
          invitationCode: invitation.content.code,
          dateOfEnrollment: FieldValue.serverTimestamp(),
        })

        const invitationRef = firestore.doc(`invitations/${invitation.id}`)
        const collections = await invitationRef.listCollections()
        for (const collection of collections) {
          const items = await transaction.get(collection)
          for (const item of items.docs) {
            transaction.create(collection.doc(item.id), item.data())
            transaction.delete(item.ref)
          }
        }

        transaction.delete(invitationRef)
      },
    )

    await this.updateClaims(userId)
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

  async getAllPatients(): Promise<Array<Document<User>>> {
    return this.databaseService.getQuery<User>((firestore) =>
      firestore.collection('users').where('type', '==', UserType.patient),
    )
  }

  async getUser(userId: string): Promise<Document<User> | undefined> {
    return this.databaseService.getDocument<User>(`users/${userId}`)
  }

  async deleteUser(userId: string): Promise<void> {
    await this.databaseService.bulkWrite(async (firestore, writer) => {
      await firestore.recursiveDelete(firestore.doc(`users/${userId}`), writer)
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
