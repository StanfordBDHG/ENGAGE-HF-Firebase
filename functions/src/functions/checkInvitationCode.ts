//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

// Based on:
// https://github.com/StanfordBDHG/PediatricAppleWatchStudy/pull/54/files

import {
  checkInvitationCodeInputSchema,
  type CheckInvitationCodeOutput,
} from '@stanfordbdhg/engagehf-models'
import { https, logger } from 'firebase-functions/v2'
import { validatedOnCall } from './helpers.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const checkInvitationCode = validatedOnCall(
  'checkInvitationCode',
  checkInvitationCodeInputSchema,
  async (request): Promise<CheckInvitationCodeOutput> => {
    const factory = getServiceFactory()
    const userId = factory.credential(request.auth).userId

    if (!request.data.invitationCode.match(/^[A-Z0-9]{6,12}$/))
      throw new https.HttpsError(
        'invalid-argument',
        'Invalid invitation code format.',
      )

    const { invitationCode } = request.data

    logger.debug(
      `User (${userId}) -> ENGAGE-HF, InvitationCode ${invitationCode}`,
    )

    const userService = factory.user()

    try {
      await userService.setInvitationUserId(invitationCode, userId)

      logger.debug(
        `User (${userId}) successfully enrolled in study (ENGAGE-HF) with invitation code: ${invitationCode}`,
      )

      const invitation = await userService.getInvitationByUserId(userId)

      if (!invitation)
        throw new https.HttpsError(
          'not-found',
          'Invitation not found for user.',
        )

      await userService.enrollUser(invitation, userId)
      await factory.trigger().userEnrolled(userId)
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error processing request: ${error.message}`)
        if ('message' in error) {
          throw new https.HttpsError('internal', error.message)
        }
      } else {
        logger.error(`Unknown error: ${String(error)}`)
      }
      throw error
    }
  },
)
