//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  shareHealthSummaryInputSchema,
  ShareHealthSummaryOutput,
} from '@stanfordbdhg/engagehf-models'
import { validatedOnCall } from './helpers.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'
import { UserRole } from '../services/credential/credential.js'

export const shareHealthSummary = validatedOnCall(
  'shareHealthSummary',
  shareHealthSummaryInputSchema,
  async (request): Promise<ShareHealthSummaryOutput> => {
    const factory = getServiceFactory()
    const credential = factory.credential(request.auth)
    const userId = request.data.userId ?? credential.userId

    await credential.checkAsync(
      () => [UserRole.admin, UserRole.user(userId)],
      async () => {
        const user = await factory.user().getUser(userId)
        return user?.content.organization !== undefined ?
            [
              UserRole.owner(user.content.organization),
              UserRole.clinician(user.content.organization),
            ]
          : []
      },
    )

    return await factory.patient().createShareCode(userId)
  },
)
