//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import admin from 'firebase-admin'
import { type BlockingFunction } from 'firebase-functions'
import { https, logger } from 'firebase-functions/v2'
import { type CallableRequest, onCall } from 'firebase-functions/v2/https'
import {
  type AuthBlockingEvent,
  beforeUserCreated,
} from 'firebase-functions/v2/identity'
import { FirebaseAuthService } from '../services/auth/firebaseAuthService.js'
import { FirestoreService } from '../services/database/firestoreService.js'
import { DatabaseUserService } from '../services/user/databaseUserService.js'
import { type UserService } from '../services/user/userService.js'

export interface CheckInvitationCodeInput {
  invitationCode: string
}

export const checkInvitationCodeFunction = onCall(
  async (request: CallableRequest<CheckInvitationCodeInput>) => {
    if (!request.auth?.uid) {
      throw new https.HttpsError(
        'unauthenticated',
        'User is not properly authenticated.',
      )
    }

    const userId = request.auth.uid
    const { invitationCode } = request.data

    const service: UserService = new DatabaseUserService(new FirestoreService())
    logger.debug(
      `User (${userId}) -> ENGAGE-HF, InvitationCode ${invitationCode}`,
    )

    try {
      await service.setInvitationUserId(invitationCode, userId)

      logger.debug(
        `User (${userId}) successfully enrolled in study (ENGAGE-HF) with invitation code: ${invitationCode}`,
      )

      return {}
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
  },
)

export const beforeUserCreatedFunction: BlockingFunction = beforeUserCreated(
  async (event: AuthBlockingEvent) => {
    const authService = new FirebaseAuthService()
    const service: UserService = new DatabaseUserService(new FirestoreService())
    const userId = event.data.uid

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
      if (!invitation.content) {
        throw new https.HttpsError(
          'not-found',
          'No valid invitation code found for user.',
        )
      }

      if (
        invitation.content.admin === undefined &&
        invitation.content.user?.organization !== organization.id
      )
        throw new https.HttpsError(
          'failed-precondition',
          'Organization does not match invitation code.',
        )

      await authService.updateUser(userId, {
        displayName: invitation.content.auth?.displayName,
        email: invitation.content.auth?.email,
        phoneNumber: invitation.content.auth?.phoneNumber,
        photoURL: invitation.content.auth?.photoURL,
      })

      await service.enrollUser(invitation.id, userId)
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

        await authService.updateUser(userId, {
          displayName: invitation.content.auth?.displayName,
          email: invitation.content.auth?.email,
          phoneNumber: invitation.content.auth?.phoneNumber,
          photoURL: invitation.content.auth?.photoURL,
        })

        await service.enrollUser(invitation.id, userId)
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
