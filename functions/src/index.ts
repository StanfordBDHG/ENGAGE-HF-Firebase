//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

// Based on:
// https://github.com/StanfordBDHG/PediatricAppleWatchStudy/pull/54/files

import admin from 'firebase-admin'
import { type BlockingFunction } from 'firebase-functions'
import { logger, https } from 'firebase-functions/v2'
import { type CallableRequest, onCall } from 'firebase-functions/v2/https'
import {
  type AuthBlockingEvent,
  beforeUserCreated,
} from 'firebase-functions/v2/identity'
import { generateHealthSummary } from './healthSummary/generate'
import { FhirService } from './services/fhirService'
import { FirebaseService } from './services/firebaseService' // Replace './firestoreService' with the correct path to the module containing the 'FirestoreService' class
import { HealthSummaryService } from './services/healthSummaryService'

admin.initializeApp()

interface InvitationCodeInput {
  invitationCode: string
}

export const checkInvitationCode = onCall(
  async (request: CallableRequest<InvitationCodeInput>) => {
    if (!request.auth?.uid) {
      throw new https.HttpsError(
        'unauthenticated',
        'User is not properly authenticated.',
      )
    }

    const userId = request.auth.uid
    const { invitationCode } = request.data

    const service = new FirebaseService()
    logger.debug(
      `User (${userId}) -> ENGAGE-HF, InvitationCode ${invitationCode}`,
    )

    try {
      await service.enrollUser(invitationCode, userId)

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

export const beforecreated: BlockingFunction = beforeUserCreated(
  async (event: AuthBlockingEvent) => {
    const service = new FirebaseService()
    const userId = event.data.uid

    try {
      // Check Firestore to confirm whether an invitation code has been associated with a user.
      const invitation = await service.getInvitationUsedBy(userId)

      if (!invitation) {
        throw new https.HttpsError(
          'not-found',
          `No valid invitation code found for user ${userId}.`,
        )
      }

      const user = await service.getUser(userId)

      // Check if the user document contains the correct invitation code.
      if (user.content?.invitationCode !== invitation.id) {
        throw new https.HttpsError(
          'failed-precondition',
          'User document does not exist or contains incorrect invitation code.',
        )
      }
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

interface HealthSummaryInput {
  userId?: string
}

export const exportHealthSummary = onCall(
  async (req: CallableRequest<HealthSummaryInput>) => {
    if (!req.data.userId)
      throw new https.HttpsError('invalid-argument', 'User ID is required')

    const service = new HealthSummaryService(
      new FhirService(),
      new FirebaseService(),
    )
    const data = await service.fetchHealthSummaryData(req.data.userId)
    return generateHealthSummary(data)
  },
)
