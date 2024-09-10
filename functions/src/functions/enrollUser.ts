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
import { enrollUserInputSchema } from '@stanfordbdhg/engagehf-models'

export const enrollUser = validatedOnCall(
  'enrollUser',
  enrollUserInputSchema,
  async (request) => {
    const factory = getServiceFactory()
    const credential = factory.credential(request.auth)
    const triggerService = factory.trigger()
    const userService = factory.user()

    const userId = credential.userId
    const invitationCode = request.data.invitationCode

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
