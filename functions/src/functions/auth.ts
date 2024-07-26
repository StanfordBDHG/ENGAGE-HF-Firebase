//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import admin from 'firebase-admin'
import { https, logger } from 'firebase-functions/v2'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from 'firebase-functions/v2/identity'
import { UserType } from '../models/user.js'
import { CacheDatabaseService } from '../services/database/cacheDatabaseService.js'
import { FirestoreService } from '../services/database/firestoreService.js'
import { DatabaseUserService } from '../services/user/databaseUserService.js'
import { type UserService } from '../services/user/userService.js'

export const beforeUserCreatedFunction = beforeUserCreated(async (event) => {
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
      invitation.content.user.organization !== organization.id
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
})

export const beforeUserSignedInFunction = beforeUserSignedIn(async (event) => {
  const userService = new DatabaseUserService(
    new CacheDatabaseService(new FirestoreService()),
  )
  await userService.updateClaims(event.data.uid)
})

export const onOrganizationWrittenFunction = onDocumentWritten(
  'organizations/{organizationId}',
  async (event) => {
    const userService = new DatabaseUserService(
      new CacheDatabaseService(new FirestoreService()),
    )

    const ownersBefore = (event.data?.before.get('owners') ?? []) as string[]
    const ownersAfter = (event.data?.after.get('owners') ?? []) as string[]

    const ownersChanged = [
      ...ownersBefore.filter((owner) => !ownersAfter.includes(owner)),
      ...ownersAfter.filter((owner) => !ownersBefore.includes(owner)),
    ]

    for (const ownerId of ownersChanged) {
      try {
        await userService.updateClaims(ownerId)
      } catch (error) {
        logger.error(
          `Error processing claims update for userId '${ownerId}' on change of organization: ${String(error)}`,
        )
      }
    }
  },
)

export const onUserWrittenFunction = onDocumentWritten(
  'users/{userId}',
  async (event) => {
    const userService = new DatabaseUserService(
      new CacheDatabaseService(new FirestoreService()),
    )
    try {
      await userService.updateClaims(event.params.userId)
    } catch (error) {
      logger.error(
        `Error processing claims update for userId '${event.params.userId}' on change of user: ${String(error)}`,
      )
    }
  },
)
