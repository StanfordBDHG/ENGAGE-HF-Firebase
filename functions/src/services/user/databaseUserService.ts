//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type Auth } from 'firebase-admin/auth'
import { https } from 'firebase-functions/v2'
import { type UserService } from './userService.js'
import { type Invitation } from '../../models/types/invitation.js'
import { type Organization } from '../../models/types/organization.js'
import { type User } from '../../models/types/user.js'
import { type UserAuth } from '../../models/types/userAuth.js'
import { UserType } from '../../models/types/userType.js'
import {
  type Document,
  type DatabaseService,
} from '../database/databaseService.js'

export interface UserClaims {
  type: UserType
  organization?: string
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
      displayName: auth.displayName ?? undefined,
      email: auth.email ?? undefined,
      phoneNumber: auth.phoneNumber ?? undefined,
      photoURL: auth.photoURL ?? undefined,
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
      async (collections, transaction) => {
        const invitations = await transaction.get(
          collections.invitations.where('code', '==', content.code).limit(1),
        )
        if (!invitations.empty)
          throw new https.HttpsError(
            'invalid-argument',
            'Invitation code is not unique.',
          )
        const invitationDoc = collections.invitations.doc()
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
      (collections) =>
        collections.invitations.where('code', '==', invitationCode).limit(1),
    )
    return result.at(0)
  }

  async setInvitationUserId(
    invitationCode: string,
    userId: string,
  ): Promise<void> {
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        const invitation = (
          await collections.invitations
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
      (collections) =>
        collections.invitations.where('userId', '==', userId).limit(1),
    )
    return result.at(0)
  }

  async enrollUser(
    invitation: Document<Invitation>,
    userId: string,
  ): Promise<void> {
    const user = await this.databaseService.getDocument((collections) =>
      collections.users.doc(userId),
    )
    if (user?.content)
      throw new https.HttpsError(
        'already-exists',
        'User is already enrolled in the study.',
      )

    await this.auth.updateUser(userId, {
      displayName: invitation.content.auth?.displayName ?? undefined,
      email: invitation.content.auth?.email ?? undefined,
      phoneNumber: invitation.content.auth?.phoneNumber ?? undefined,
      photoURL: invitation.content.auth?.photoURL ?? undefined,
    })

    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        transaction.create(collections.users.doc(userId), {
          ...invitation.content.user,
          invitationCode: invitation.content.code,
          dateOfEnrollment: new Date(),
        })

        const invitationRef = collections.invitations.doc(invitation.id)
        const invitationCollections = await invitationRef.listCollections()
        for (const collection of invitationCollections) {
          const items = await transaction.get(collection)
          for (const item of items.docs) {
            transaction.create(collection.doc(item.id), item.data())
            // transaction.delete(item.ref)
          }
        }

        // transaction.delete(invitationRef)
      },
    )

    await this.updateClaims(userId)
  }

  // Organizations

  async getOrganizationBySsoProviderId(
    providerId: string,
  ): Promise<Document<Organization> | undefined> {
    const result = await this.databaseService.getQuery<Organization>(
      (collections) =>
        collections.organizations
          .where('ssoProviderId', '==', providerId)
          .limit(1),
    )
    return result.at(0)
  }

  async getOrganizations(): Promise<Array<Document<Organization>>> {
    return this.databaseService.getQuery<Organization>(
      (collections) => collections.organizations,
    )
  }

  async getOrganization(
    organizationId: string,
  ): Promise<Document<Organization> | undefined> {
    return this.databaseService.getDocument<Organization>((collections) =>
      collections.organizations.doc(organizationId),
    )
  }

  // Users

  async getAllPatients(): Promise<Array<Document<User>>> {
    return this.databaseService.getQuery<User>((collections) =>
      collections.users.where('type', '==', UserType.patient),
    )
  }

  async getUser(userId: string): Promise<Document<User> | undefined> {
    return this.databaseService.getDocument<User>((collections) =>
      collections.users.doc(userId),
    )
  }

  async deleteUser(userId: string): Promise<void> {
    await this.databaseService.bulkWrite(async (collections, writer) => {
      await collections.firestore.recursiveDelete(
        collections.users.doc(userId),
        writer,
      )
      await this.auth.deleteUser(userId)
    })
  }
}
