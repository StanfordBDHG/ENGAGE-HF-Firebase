//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

// Based on:
// https://github.com/StanfordBDHG/PediatricAppleWatchStudy/pull/54/files

import * as admin from 'firebase-admin'
import { FieldValue, type Transaction } from 'firebase-admin/firestore'
import { type BlockingFunction } from 'firebase-functions'
import { logger, https } from 'firebase-functions/v2'
import { type CallableRequest, onCall } from 'firebase-functions/v2/https'
import {
  type AuthBlockingEvent,
  beforeUserCreated,
} from 'firebase-functions/v2/identity'

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

    const firestore = admin.firestore()
    logger.debug(
      `User (${userId}) -> ENGAGE-HF, InvitationCode ${invitationCode}`,
    )

    try {
      // Based on https://github.com/StanfordSpezi/SpeziStudyApplication/blob/main/functions/index.js
      const invitationCodeRef = firestore.doc(
        `invitationCodes/${invitationCode}`,
      )
      const invitationCodeDoc = await invitationCodeRef.get()

      if (!invitationCodeDoc.exists || invitationCodeDoc.data()?.used) {
        throw new https.HttpsError(
          'not-found',
          'Invitation code not found or already used.',
        )
      }

      const userStudyRef = firestore.doc(`users/${userId}`)
      const userStudyDoc = await userStudyRef.get()

      if (userStudyDoc.exists) {
        throw new https.HttpsError(
          'already-exists',
          'User is already enrolled in the study.',
        )
      }

      // eslint-disable-next-line @typescript-eslint/require-await
      await firestore.runTransaction(async (transaction: Transaction) => {
        transaction.set(userStudyRef, {
          invitationCode: invitationCode,
          dateOfEnrollment: FieldValue.serverTimestamp(),
        })

        transaction.update(invitationCodeRef, {
          used: true,
          usedBy: userId,
        })
      })

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
    const firestore = admin.firestore()
    const userId = event.data.uid

    try {
      // Check Firestore to confirm whether an invitation code has been associated with a user.
      const invitationQuerySnapshot = await firestore
        .collection('invitationCodes')
        .where('usedBy', '==', userId)
        .limit(1)
        .get()

      logger.info(
        `Invitation code query snapshot: ${invitationQuerySnapshot.size}`,
      )

      if (invitationQuerySnapshot.empty) {
        throw new https.HttpsError(
          'not-found',
          `No valid invitation code found for user ${userId}.`,
        )
      }

      const userDoc = await firestore.doc(`users/${userId}`).get()

      // Check if the user document exists and contains the correct invitation code.
      if (
        !userDoc.exists ||
        userDoc.data()?.invitationCode !== invitationQuerySnapshot.docs[0].id
      ) {
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
