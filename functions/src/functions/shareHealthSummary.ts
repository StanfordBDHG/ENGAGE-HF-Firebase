//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  dateConverter,
  shareHealthSummaryInputSchema,
  type ShareHealthSummaryOutput,
} from '@stanfordbdhg/engagehf-models'
import { validatedOnCall } from './helpers.js'
import { Env } from '../env.js'
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

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

    const shareCodeDocument = await factory.patient().createShareCode(userId)
    const url = `${Env.WEB_FRONTEND_BASE_URL}/users/${userId}/healthSummary/${shareCodeDocument.id}`
    return {
      code: shareCodeDocument.content.code,
      expiresAt: dateConverter.encode(shareCodeDocument.content.expiresAt),
      url: url,
    }
  },
)
