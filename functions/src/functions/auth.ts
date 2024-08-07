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
  beforeUserCreated,
  beforeUserSignedIn,
} from 'firebase-functions/v2/identity'
import { UserType } from '../models/user.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const beforeUserCreatedFunction = beforeUserCreated(async (event) => {
  const factory = getServiceFactory()
  const userService = factory.user()
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

    const invitation = await userService.getInvitation(event.data.email)
    if (!invitation?.content) {
      throw new https.HttpsError(
        'not-found',
        'No valid invitation code found for user.',
      )
    }

    if (
      invitation.content.user.type === UserType.admin &&
      invitation.content.user.organization !== organization.id
    )
      throw new https.HttpsError(
        'failed-precondition',
        'Organization does not match invitation code.',
      )

    await userService.enrollUser(invitation, userId)
  } else {
    try {
      // Check Firestore to confirm whether an invitation code has been associated with a user.
      const invitation = await userService.getInvitationByUserId(userId)

      if (!invitation) {
        throw new https.HttpsError(
          'not-found',
          `No valid invitation code found for user ${userId}.`,
        )
      }

      await userService.enrollUser(invitation, userId)
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
  await getServiceFactory().user().updateClaims(event.data.uid)
})
