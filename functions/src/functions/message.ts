//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { https } from 'firebase-functions'
import { type CallableRequest, onCall } from 'firebase-functions/v2/https'
import { FirestoreService } from '../services/database/firestoreService'

export interface DismissMessageInput {
  messageId?: string
  didPerformAction?: boolean
}

export const dismissMessageFunction = onCall(
  async (request: CallableRequest<DismissMessageInput>) => {
    if (!request.auth?.uid)
      throw new https.HttpsError(
        'unauthenticated',
        'User is not properly authenticated.',
      )

    const userId = request.auth.uid
    const { messageId, didPerformAction } = request.data
    if (!messageId)
      throw new https.HttpsError('invalid-argument', 'Message ID is required')

    try {
      const service = new FirestoreService()
      await service.dismissMessage(
        userId,
        messageId,
        didPerformAction ?? false,
      )
    } catch (error) {
      console.error(error)
      throw new https.HttpsError('internal', 'Internal server error.')
    }
  },
)
