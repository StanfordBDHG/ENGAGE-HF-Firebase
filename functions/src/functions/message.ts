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
  userId: z.string().or(z.null()).default(null),
  messageId: z.string(),
  didPerformAction: z.boolean().default(false),
})

export const dismissMessage = validatedOnCall(
  dismissMessageInputSchema,
  async (request): Promise<void> => {
    const userId = request.data.userId ?? request.auth?.uid

    if (!userId)
      throw new https.HttpsError('not-found', 'User could not be found.')

    try {
      const factory = getServiceFactory()

      factory
        .credential(request.auth)
        .check(UserRole.admin, UserRole.user(userId))

      await factory
        .message()
        .dismissMessage(
          userId,
          request.data.messageId,
          request.data.didPerformAction,
        )
    } catch (error) {
      console.error(error)
      throw new https.HttpsError('internal', 'Internal server error.')
    }
  },
)
