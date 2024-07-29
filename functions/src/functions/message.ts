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
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

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
      const factory = getServiceFactory()

      factory
        .credential(request.auth)
        .check(UserRole.admin, UserRole.user(userId))

      await factory
        .user()
        .dismissMessage(userId, messageId, didPerformAction ?? false)
    } catch (error) {
      console.error(error)
      throw new https.HttpsError('internal', 'Internal server error.')
    }
  },
)
