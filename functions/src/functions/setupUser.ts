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

export const setupUser = validatedOnCall(z.unknown(), async (request) => {
  const userId = request.auth?.uid
  const invitationCode: unknown = request.auth?.token.invitationCode
  if (
    userId === undefined ||
    invitationCode === undefined ||
    typeof invitationCode !== 'string'
  )
    throw new https.HttpsError('unauthenticated', 'User is not authenticated')

  const factory = getServiceFactory()
  const userService = factory.user()
  const triggerService = factory.trigger()

  const invitation = await userService.getInvitationByCode(invitationCode)
  if (invitation === undefined)
    throw new https.HttpsError('not-found', 'Invitation not found')

  await userService.enrollUser(invitation, userId)

  logger.debug(
    `User (${userId}) successfully enrolled in the study with invitation code: ${invitationCode}`,
  )

  await triggerService.userEnrolled(userId)
})
