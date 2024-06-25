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
import { FieldValue, type Transaction } from 'firebase-admin/firestore'
import { type BlockingFunction } from 'firebase-functions'
import { onRequest } from 'firebase-functions/v1/https'
import { logger, https } from 'firebase-functions/v2'
import { type CallableRequest, onCall } from 'firebase-functions/v2/https'
import {
  type AuthBlockingEvent,
  beforeUserCreated,
} from 'firebase-functions/v2/identity'
import { generateHealthSummary } from './healthSummary/generate.js'

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
      const invitationRef = firestore.doc(`invitations/${invitationCode}`)
      const invitationDoc = await invitationRef.get()

      if (!invitationDoc.exists || invitationDoc.data()?.used) {
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

        transaction.update(invitationRef, {
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
        .collection('invitations')
        .where('usedBy', '==', userId)
        .limit(1)
        .get()

      logger.info(`Invitation query snapshot: ${invitationQuerySnapshot.size}`)

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

export const exportHealthSummary = onRequest(async (req, res) => {
  const data = await generateHealthSummary({
    name: 'John Doe',
    dateOfBirth: new Date('1970-01-02'),
    provider: 'Dr. XXX',
    nextAppointment: new Date('2024-02-03'),
    currentMedications: [
      { name: 'Dapagliflozin 5mg', instruction: 'Take Once Daily' },
      { name: 'Losartan 25mg', instruction: 'Take Once Daily' },
    ],
    proposedMedications: [
      { name: 'Carvediol 3.125mg', instruction: 'Take Once Daily', isBold: true },
      {
        name: 'Sacubitril-Valsartan 24-25mg',
        instruction: 'Take Twice Daily',
      },
    ],
    vitals: {
      systolicBloodPressure: [
        { date: new Date('2024-02-01'), value: 110 },
        { date: new Date('2024-01-31'), value: 114 },
        { date: new Date('2024-01-30'), value: 123 },
        { date: new Date('2024-01-29'), value: 109 },
        { date: new Date('2024-01-28'), value: 105 },
        { date: new Date('2024-01-27'), value: 98 },
        { date: new Date('2024-01-26'), value: 94 },
        { date: new Date('2024-01-25'), value: 104 },
        { date: new Date('2024-01-24'), value: 102 }
      ],
      diastolicBloodPressure: [
        { date: new Date('2024-02-01'), value: 70 },
        { date: new Date('2024-01-31'), value: 82 },
        { date: new Date('2024-01-30'), value: 75 },
        { date: new Date('2024-01-29'), value: 77 },
        { date: new Date('2024-01-28'), value: 72 },
        { date: new Date('2024-01-27'), value: 68 },
        { date: new Date('2024-01-26'), value: 65 },
        { date: new Date('2024-01-25'), value: 72 },
        { date: new Date('2024-01-24'), value: 80 }
      ],
      heartRate: [
        { date: new Date('2024-02-01'), value: 79 },
        { date: new Date('2024-01-31'), value: 62 },
        { date: new Date('2024-01-30'), value: 77 },
        { date: new Date('2024-01-29'), value: 63 },
        { date: new Date('2024-01-28'), value: 61 },
        { date: new Date('2024-01-27'), value: 70 },
        { date: new Date('2024-01-26'), value: 67 },
        { date: new Date('2024-01-25'), value: 80 },
        { date: new Date('2024-01-24'), value: 65 }
      ],
      weight: [
        { date: new Date('2024-02-01'), value: 269 },
        { date: new Date('2024-01-31'), value: 267 },
        { date: new Date('2024-01-30'), value: 267 },
        { date: new Date('2024-01-29'), value: 265 },
        { date: new Date('2024-01-28'), value: 268 },
        { date: new Date('2024-01-27'), value: 268 },
        { date: new Date('2024-01-26'), value: 266 },
        { date: new Date('2024-01-25'), value: 266 },
        { date: new Date('2024-01-24'), value: 267 }
      ],
      dryWeight: 267,
    },
    symptomScores: [
      {
        overall: 40,
        physicalLimits: 50,
        socialLimits: 38,
        qualityOfLife: 20,
        specificSymptoms: 60,
        dizziness: 50,
        date: new Date('2024-01-24'),
      },
      {
        overall: 60,
        physicalLimits: 58,
        socialLimits: 75,
        qualityOfLife: 37,
        specificSymptoms: 72,
        dizziness: 70,
        date: new Date('2024-01-15'),
      },
      {
        overall: 44,
        physicalLimits: 50,
        socialLimits: 41,
        qualityOfLife: 25,
        specificSymptoms: 60,
        dizziness: 50,
        date: new Date('2023-12-30'),
      },
      {
        overall: 75,
        physicalLimits: 58,
        socialLimits: 75,
        qualityOfLife: 60,
        specificSymptoms: 80,
        dizziness: 100,
        date: new Date('2023-12-15'),
      },
    ],
  })

  res.write(data)
  res.end()
})
