//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { https } from 'firebase-functions/v2'
import { z } from 'zod'
import { validatedOnCall } from './helpers.js'
import { generateHealthSummary } from '../healthSummary/generate.js'
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

const exportHealthSummaryInputSchema = z.object({
  userId: z.string(),
})

export const exportHealthSummary = validatedOnCall(
  exportHealthSummaryInputSchema,
  async (request): Promise<Buffer> => {
    if (!request.data.userId)
      throw new https.HttpsError('invalid-argument', 'User ID is required')

    const factory = getServiceFactory()
    const userService = factory.user()
    const credential = factory.credential(request.auth)
    const user = await userService.getUser(request.data.userId)

    credential.check(
      UserRole.admin,
      UserRole.user(request.data.userId),
      ...(user?.content.organization ?
        [
          UserRole.owner(user.content.organization),
          UserRole.clinician(user.content.organization),
        ]
      : []),
    )

    const healthSummaryService = factory.healthSummary()
    const data = await healthSummaryService.getHealthSummaryData(
      request.data.userId,
    )
    return generateHealthSummary(data, {
      language: user?.content.language ?? 'en',
    })
  },
)
