//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  advanceDateByDays,
  type Invitation,
  type Organization,
  User,
  type UserAuth,
  UserType,
} from '@stanfordbdhg/engagehf-models'
import { type Auth } from 'firebase-admin/auth'
import { https, logger } from 'firebase-functions/v2'
import { type UserService } from './userService.js'
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
    try {
      const user = await this.getUser(userId)
      if (user !== undefined) {
        const claims: UserClaims = {
          type: user.content.type,
        }
        if (user.content.organization !== undefined)
          claims.organization = user.content.organization
        logger.info(
          `Will set claims for user ${userId}: ${JSON.stringify(claims)}`,
        )
        await this.auth.setCustomUserClaims(userId, claims)
        logger.info(`Successfully set claims for user ${userId}.`)
      } else {
        const invitation = await this.getInvitationByUserId(userId)
        if (invitation === undefined)
          throw new https.HttpsError('not-found', 'User not found.')

        await this.auth.setCustomUserClaims(userId, {
          invitationCode: invitation.content.code,
        })
        logger.info(
          `Successfully set claims for not-yet-enrolled user ${userId}.`,
        )
      }
    } catch (error) {
      logger.error(
        `Failed to update claims for user ${userId}: ${String(error)}`,
      )
      await this.auth.setCustomUserClaims(userId, {})
      logger.debug(
        `Successfully reset claims for user ${userId} to empty object.`,
      )
      throw error
    }
  }

  // Invitations

  async createInvitation(content: Invitation): Promise<{ id: string }> {
    const id = await this.databaseService.runTransaction(
      async (collections, transaction) => {
        const invitations = await transaction.get(
          collections.invitations.where('code', '==', content.code).limit(1),
        )
        if (!invitations.empty) {
          logger.error(
            `Invitation code '${content.code}' already exists in invitations with ids [${invitations.docs.map((doc) => `'${doc.id}'`).join(', ')}].`,
          )
          throw new https.HttpsError(
            'invalid-argument',
            'Invitation code is not unique.',
          )
        }
        const invitationDoc = collections.invitations.doc()
        transaction.create(invitationDoc, content)
        logger.info(
          `Created invitation with code '${content.code}' using id '${invitationDoc.id}'.`,
        )
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

  async getInvitationByUserId(
    userId: string,
  ): Promise<Document<Invitation> | undefined> {
    const result = await this.databaseService.getQuery<Invitation>(
      (collections) =>
        collections.invitations.where('userId', '==', userId).limit(1),
    )
    return result.at(0)
  }

  async connectInvitationToUser(
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
        if (invitation === undefined) {
          logger.error(`Invitation with code '${invitationCode}' not found.`)
          throw new Error('Invitation not found')
        }
        logger.info(
          `Setting userId '${userId}' for invitation with code '${invitationCode}' at id '${invitation.id}'.`,
        )
        transaction.update(invitation.ref, { userId: userId })
      },
    )

    await this.auth.setCustomUserClaims(userId, {
      invitationCode: invitationCode,
    })
  }

  async enrollUser(
    invitation: Document<Invitation>,
    userId: string,
  ): Promise<void> {
    logger.info(
      `About to enroll user ${userId} using invitation at '${invitation.id}' with code '${invitation.content.code}'.`,
    )
    const user = await this.databaseService.getDocument((collections) =>
      collections.users.doc(userId),
    )
    if (userId !== invitation.content.userId) {
      logger.error(
        `User with id ${userId} is not connected to invitation with id ${invitation.id}.`,
      )
      throw new https.HttpsError(
        'permission-denied',
        'Invitation does not belong to the user.',
      )
    }
    if (user?.content !== undefined) {
      logger.error(`User with id ${userId} already exists.`)
      throw new https.HttpsError(
        'already-exists',
        'User is already enrolled in the study.',
      )
    }

    await this.auth.updateUser(userId, {
      displayName: invitation.content.auth?.displayName ?? undefined,
      email: invitation.content.auth?.email ?? undefined,
      phoneNumber: invitation.content.auth?.phoneNumber ?? undefined,
      photoURL: invitation.content.auth?.photoURL ?? undefined,
    })

    logger.info(
      `Updated auth information for user with id '${userId}' using invitation auth content.`,
    )

    const invitationCollections = await this.databaseService.runTransaction(
      async (collections, transaction) => {
        const invitationRef = collections.invitations.doc(invitation.id)
        const invitationCollections = await invitationRef.listCollections()

        transaction.set(
          collections.users.doc(userId),
          new User({
            ...invitation.content.user,
            invitationCode: invitation.content.code,
            dateOfEnrollment: new Date(),
          }),
        )

        return invitationCollections
      },
    )

    logger.info(
      `Created user with id '${userId}' using invitation content. Will now copy invitation collections: [${invitationCollections.map((collection) => `'${collection.id}'`).join(', ')}].`,
    )

    await Promise.all(
      invitationCollections.map(async (invitationCollection) =>
        this.databaseService.runTransaction(
          async (collections, transaction) => {
            const userRef = collections.users.doc(userId)
            const collectionId = invitationCollection.id
            const items = await transaction.get(invitationCollection)
            for (const item of items.docs) {
              transaction.create(
                userRef.collection(collectionId).doc(item.id),
                item.data(),
              )
              transaction.delete(item.ref)
            }

            logger.info(
              `Copied invitation collection '${collectionId}' with ${items.size} items for user '${userId}'.`,
            )
          },
        ),
      ),
    )

    await this.databaseService.bulkWrite(async (collections, writer) => {
      await collections.firestore.recursiveDelete(
        collections.invitations.doc(invitation.id),
        writer,
      )
    })

    await this.updateClaims(userId)
  }

  async deleteInvitation(invitation: Document<Invitation>): Promise<void> {
    await this.databaseService.bulkWrite(async (collections, _) => {
      const ref = collections.invitations.doc(invitation.id)
      await collections.firestore.recursiveDelete(ref)
    })

    logger.info(`Deleted invitation with id '${invitation.id}' recursively.`)
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
      logger.info(`Deleted user with id '${userId}' recursively.`)
      await this.auth.deleteUser(userId)
      logger.info(`Deleted user auth with id '${userId}'.`)
    })
  }

  async deleteExpiredAccounts(): Promise<void> {
    const oneDayAgo = advanceDateByDays(new Date(), -1)
    const promises: Array<Promise<void>> = []
    let pageToken: string | undefined = undefined
    do {
      const usersResult = await this.auth.listUsers(1_000, pageToken)
      pageToken = usersResult.pageToken
      for (const user of usersResult.users) {
        if (
          Object.keys(user.customClaims ?? {}).length === 0 &&
          new Date(user.metadata.lastSignInTime) < oneDayAgo
        ) {
          logger.info(`Deleting expired account ${user.uid}`)
          promises.push(
            this.auth
              .deleteUser(user.uid)
              .catch((error: unknown) =>
                console.error(
                  `Failed to delete expired account ${user.uid}: ${String(error)}`,
                ),
              ),
          )
        }
      }
    } while (pageToken !== undefined)

    await Promise.all(promises)
  }
}
