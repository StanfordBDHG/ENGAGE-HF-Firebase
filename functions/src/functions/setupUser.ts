//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { https, logger } from 'firebase-functions'
import { z } from 'zod'
import { validatedOnCall } from './helpers.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const setupUser = validatedOnCall(
  'setupUser',
  z.unknown(),
  async (request) => {
    const factory = getServiceFactory()
    const userId = factory.credential(request.auth).userId
    const invitationCode = z.string().parse(request.auth?.token.invitationCode)

    const userService = factory.user()
    const triggerService = factory.trigger()

    const invitation = await userService.getInvitationByCode(invitationCode)
    if (invitation === undefined)
      throw new https.HttpsError('not-found', 'Invitation not found')

    await userService.enrollUser(invitation, userId)

    logger.debug(
      `setupUser: User '${userId}' successfully enrolled in the study with invitation code: ${invitationCode}`,
    )

    await triggerService.userEnrolled(userId)

    logger.debug(`setupUser: User '${userId}' enrollment triggers finished`)
  },
)
