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
import { type Result } from './types.js'
import { type UserAuth, type User } from '../models/user.js'
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

const getUsersInformationInputSchema = z.object({
  includeUserData: z.boolean().optional(),
  userIds: z.array(z.string()).max(100),
})

export interface UserInformation {
  auth: UserAuth
  user?: User
}

export type GetUsersInformationOutput = Record<string, Result<UserInformation>>

export const getUsersInformationFunction = validatedOnCall(
  getUsersInformationInputSchema,
  async (request): Promise<GetUsersInformationOutput> => {
    if (!request.auth?.uid)
      throw new https.HttpsError('unauthenticated', 'User is not authenticated')

    const factory = getServiceFactory()
    const credential = factory.credential(request.auth)
    const userService = factory.user()

    const result: GetUsersInformationOutput = {}
    for (const userId of request.data.userIds) {
      try {
        const userData = await userService.getUser(userId)

        credential.check(
          UserRole.admin,
          UserRole.user(userId),
          ...(userData?.content.organization ?
            [
              UserRole.owner(userData.content.organization),
              UserRole.clinician(userData.content.organization),
            ]
          : []),
        )

        const user = await userService.getAuth(userId)
        const userInformation: UserInformation = {
          auth: {
            displayName: user.displayName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            photoURL: user.photoURL,
          },
        }
        if (request.data.includeUserData ?? false) {
          userInformation.user = userData?.content
        }
        result[userId] = { data: userInformation }
      } catch (error) {
        if (error instanceof https.HttpsError) {
          result[userId] = {
            error: {
              code: error.code,
              message: error.message,
            },
          }
        } else if (error instanceof Error) {
          result[userId] = {
            error: {
              code: '500',
              message: error.message,
            },
          }
        } else {
          result[userId] = {
            error: {
              code: '500',
              message: 'Internal server error',
            },
          }
        }
      }
    }
    return result
  },
)

const updateUserInformationInputSchema = z.object({
  userId: z.string(),
  data: z.object({
    auth: z.object({
      displayName: z.string().optional(),
      email: z.string().email().optional(),
      phoneNumber: z.string().optional(),
      photoURL: z.string().optional(),
    }),
  }),
})

export const updateUserInformationFunction = validatedOnCall(
  updateUserInformationInputSchema,
  async (request): Promise<void> => {
    if (!request.auth?.uid)
      throw new https.HttpsError('unauthenticated', 'User is not authenticated')

    const factory = getServiceFactory()
    const credential = factory.credential(request.auth)
    const userService = factory.user()
    try {
      credential.check(UserRole.admin, UserRole.user(request.data.userId))
    } catch {
      const user = await userService.getUser(request.auth.uid)
      if (!user?.content.organization) throw credential.permissionDeniedError()
      credential.check(
        UserRole.owner(user.content.organization),
        UserRole.clinician(user.content.organization),
      )
    }

    await userService.updateAuth(request.data.userId, request.data.data.auth)
  },
)

const deleteUserInputSchema = z.object({
  userId: z.string(),
})

export const deleteUserFunction = validatedOnCall(
  deleteUserInputSchema,
  async (request): Promise<void> => {
    if (!request.auth?.uid)
      throw new https.HttpsError('unauthenticated', 'User is not authenticated')

    const factory = getServiceFactory()
    const credential = factory.credential(request.auth)
    const userService = factory.user()
    try {
      credential.check(UserRole.admin)
    } catch {
      const user = await userService.getUser(request.auth.uid)
      if (!user?.content.organization) throw credential.permissionDeniedError()
      credential.check(
        UserRole.owner(user.content.organization),
        UserRole.clinician(user.content.organization),
      )
    }
    await userService.deleteUser(request.data.userId)
  },
)
