//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { https } from 'firebase-functions'
import { z } from 'zod'
import { validatedOnCall } from './helpers.js'
import { CacheDatabaseService } from '../services/database/cacheDatabaseService.js'
import { FirestoreService } from '../services/database/firestoreService.js'
import { DatabaseUserService } from '../services/user/databaseUserService.js'

const dismissMessageInputSchema = z.object({
  messageId: z.string(),
  didPerformAction: z.boolean().optional(),
})

export const dismissMessageFunction = validatedOnCall(
  dismissMessageInputSchema,
  async (request): Promise<void> => {
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
      const service = new DatabaseUserService(
        new CacheDatabaseService(new FirestoreService()),
      )
      await service.dismissMessage(userId, messageId, didPerformAction ?? false)
    } catch (error) {
      console.error(error)
      throw new https.HttpsError('internal', 'Internal server error.')
    }
  },
)
