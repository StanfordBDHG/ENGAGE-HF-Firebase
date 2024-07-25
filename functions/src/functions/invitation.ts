//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { https, logger } from 'firebase-functions/v2'
import { type CallableRequest, onCall } from 'firebase-functions/v2/https'
import { type User, type UserAuth, UserType } from '../models/user.js'
import { Credential, UserRole } from '../services/credential.js'
import { CacheDatabaseService } from '../services/database/cacheDatabaseService.js'
import { FirestoreService } from '../services/database/firestoreService.js'
import { DatabaseUserService } from '../services/user/databaseUserService.js'
import { type UserService } from '../services/user/userService.js'

export interface CreateInvitationInput {
  auth?: UserAuth
  user?: User
}

export interface CreateInvitationOutput {
  code: string
}

export const createInvitationFunction = onCall(
  async (
    request: CallableRequest<CreateInvitationInput>,
  ): Promise<CreateInvitationOutput> => {
    if (!request.auth?.uid)
      throw new https.HttpsError('unauthenticated', 'User is not authenticated')

    if (!request.data.auth)
      throw new https.HttpsError(
        'invalid-argument',
        'User authentication data is required',
      )

    if (!request.data.user)
      throw new https.HttpsError('invalid-argument', 'User data is required')

    const userService: UserService = new DatabaseUserService(
      new CacheDatabaseService(new FirestoreService()),
    )
    const credential = new Credential(request.auth, userService)
    if (request.data.user.type === UserType.admin) {
      await credential.checkAny(UserRole.admin)
    } else if (request.data.user.organization) {
      await credential.checkAny(UserRole.owner(request.data.user.organization))
    } else {
      throw credential.permissionDeniedError()
    }

    const usesGeneratedCode =
      request.data.user.type === UserType.patient ||
      request.data.auth.email === undefined

    for (let counter = 0; ; counter++) {
      const invitationCode =
        (usesGeneratedCode ? request.data.auth.email : undefined) ??
        generateInvitationCode(8)
      try {
        await userService.createInvitation(invitationCode, request.data)
        return { code: invitationCode }
      } catch (error) {
        if (counter < 4 && !usesGeneratedCode) continue
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

export interface CheckInvitationCodeInput {
  invitationCode: string
}

export const checkInvitationCodeFunction = onCall(
  async (request: CallableRequest<CheckInvitationCodeInput>) => {
    if (!request.auth?.uid) {
      throw new https.HttpsError(
        'unauthenticated',
        'User is not properly authenticated.',
      )
    }

    const userId = request.auth.uid
    const { invitationCode } = request.data

    const service: UserService = new DatabaseUserService(
      new CacheDatabaseService(new FirestoreService()),
    )
    logger.debug(
      `User (${userId}) -> ENGAGE-HF, InvitationCode ${invitationCode}`,
    )

    try {
      await service.setInvitationUserId(invitationCode, userId)

      logger.debug(
        `User (${userId}) successfully enrolled in study (ENGAGE-HF) with invitation code: ${invitationCode}`,
      )

      return {}
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
