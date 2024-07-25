//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import admin from 'firebase-admin'
import { https, logger } from 'firebase-functions/v2'
import {
  type AuthBlockingEvent,
  beforeUserCreated,
  beforeUserSignedIn,
} from 'firebase-functions/v2/identity'
import { CacheDatabaseService } from '../services/database/cacheDatabaseService.js'
import { FirestoreService } from '../services/database/firestoreService.js'
import { DatabaseUserService } from '../services/user/databaseUserService.js'
import {
  type UserClaims,
  type UserService,
} from '../services/user/userService.js'
import { UserType } from '../models/user.js'

export const beforeSignInFunction = beforeUserSignedIn(async (event) => {
  const userService = new DatabaseUserService(
    new CacheDatabaseService(new FirestoreService()),
  )
  const user = await userService.getUser(event.data.uid)
  if (!user) throw new https.HttpsError('not-found', 'User not found.')

  const claims: UserClaims = {
    type: user.content.type,
    organization: user.content.organization,
    isOwner: false,
  }

  if (user.content.organization) {
    const organization = await userService.getOrganization(
      user.content.organization,
    )
    if (organization)
      claims.isOwner = organization.content.owners.includes(event.data.uid)
    else console.error(`Organization ${user.content.organization} not found`)
  }

  await userService.setClaims(event.data.uid, claims)
})

export const beforeUserCreatedFunction = beforeUserCreated(
  async (event: AuthBlockingEvent) => {
    const service: UserService = new DatabaseUserService(
      new CacheDatabaseService(new FirestoreService()),
    )
    const userId = event.data.uid
    console.log(`beforeUserCreated for userId: ${userId}`)

    if (event.credential) {
      if (!event.data.email)
        throw new https.HttpsError(
          'invalid-argument',
          'Email address is required for user.',
        )

      const organization = (
        await admin
          .firestore()
          .collection('organizations')
          .where('ssoProviderId', '==', event.credential.providerId)
          .limit(1)
          .get()
      ).docs.at(0)

      if (!organization?.exists)
        throw new https.HttpsError(
          'failed-precondition',
          'Organization not found.',
        )

      const invitation = await service.getInvitation(event.data.email)
      if (!invitation?.content) {
        throw new https.HttpsError(
          'not-found',
          'No valid invitation code found for user.',
        )
      }

      if (
        invitation.content.user?.type === UserType.admin &&
        invitation.content.user?.organization !== organization.id
      )
        throw new https.HttpsError(
          'failed-precondition',
          'Organization does not match invitation code.',
        )

      await service.enrollUser(invitation, userId)
    } else {
      try {
        // Check Firestore to confirm whether an invitation code has been associated with a user.
        const invitation = await service.getInvitationByUserId(userId)

        if (!invitation) {
          throw new https.HttpsError(
            'not-found',
            `No valid invitation code found for user ${userId}.`,
          )
        }

        await service.enrollUser(invitation, userId)
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Error processing request: ${error.message}`)
          if ('code' in error) {
            throw new https.HttpsError('internal', 'Internal server error.')
          }
        } else {
          logger.error(`Unknown error: ${String(error)}`)
        }
        throw error
      }
    }
  },
)
