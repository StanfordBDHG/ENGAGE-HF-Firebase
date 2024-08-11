//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { https, logger } from 'firebase-functions/v2'
import { z } from 'zod'
import { validatedOnCall } from './helpers.js'
import { type Invitation } from '../models/invitation.js'
import { UserType } from '../models/user.js'
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

const createInvitationInputSchema = z.object({
  auth: z.object({
    displayName: z.string().optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    photoURL: z.string().optional(),
  }),
  user: z.object({
    type: z.nativeEnum(UserType),
    organization: z.string().optional(),
    clinician: z.string().optional(),
    language: z.string().optional(),
    timeZone: z.string().optional(),
    dateOfBirth: z.string().datetime().optional(),
  }),
})

export interface CreateInvitationOutput {
  id: string
}

export const createInvitation = validatedOnCall(
  createInvitationInputSchema,
  async (request): Promise<CreateInvitationOutput> => {
    if (!request.auth?.uid)
      throw new https.HttpsError('unauthenticated', 'User is not authenticated')

    const factory = getServiceFactory()
    const credential = factory.credential(request.auth)
    if (request.data.user.type === UserType.admin) {
      credential.check(UserRole.admin)
    } else if (request.data.user.organization) {
      credential.check(
        UserRole.admin,
        UserRole.owner(request.data.user.organization),
        UserRole.clinician(request.data.user.organization),
      )
    } else {
      throw credential.permissionDeniedError()
    }

    const userService = factory.user()
    const isPatient = request.data.user.type === UserType.patient

    for (let counter = 0; ; counter++) {
      const invitationCode =
        isPatient ? generateInvitationCode(8) : request.data.auth.email
      if (!invitationCode)
        throw new https.HttpsError(
          'invalid-argument',
          'Invalid invitation code',
        )

      try {
        const invitation: Invitation = {
          ...request.data,
          code: invitationCode,
        }
        const { id } = await userService.createInvitation(invitation)
        return { id }
      } catch (error) {
        if (counter < 4 && isPatient) continue
        throw error
      }
    }
  },
)

function generateInvitationCode(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const charactersLength = characters.length
  let result = ''
  for (let counter = 0; counter < length; counter++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const checkInvitationCodeInputSchema = z.object({
  invitationCode: z.string(),
})

export const checkInvitationCode = validatedOnCall(
  checkInvitationCodeInputSchema,
  async (request): Promise<void> => {
    if (!request.auth?.uid) {
      throw new https.HttpsError(
        'unauthenticated',
        'User is not properly authenticated.',
      )
    }

    if (!request.data.invitationCode.match(/^[A-Z0-9]{6,12}$/))
      throw new https.HttpsError(
        'invalid-argument',
        'Invalid invitation code format.',
      )

    const userId = request.auth.uid
    const { invitationCode } = request.data

    logger.debug(
      `User (${userId}) -> ENGAGE-HF, InvitationCode ${invitationCode}`,
    )

    const factory = getServiceFactory()
    const userService = factory.user()

    try {
      await userService.setInvitationUserId(invitationCode, userId)

      logger.debug(
        `User (${userId}) successfully enrolled in study (ENGAGE-HF) with invitation code: ${invitationCode}`,
      )

      return
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error processing request: ${error.message}`)
        if ('code' in error) {
          throw new https.HttpsError('internal', 'Internal server error.')
        }
      } else {
        logger.error(`Unknown error: ${String(error)}`)
      }
      throw error
    }
  },
)
