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
import { Credential, UserRole } from '../services/credential.js'
import { CacheDatabaseService } from '../services/database/cacheDatabaseService.js'
import { FirestoreService } from '../services/database/firestoreService.js'
import { DatabaseUserService } from '../services/user/databaseUserService.js'
import { type UserService } from '../services/user/userService.js'

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

    const userService = new DatabaseUserService(
      new CacheDatabaseService(new FirestoreService()),
    )
    const authenticatedUser = await userService.getUser(request.auth.uid)
    if (!authenticatedUser)
      throw new https.HttpsError('not-found', 'User not found')
    const organization = authenticatedUser.content.organization

    const credential = new Credential(request.auth, userService)
    await credential.checkAny(
      UserRole.admin,
      ...(organization ? [UserRole.clinician(organization)] : []),
    )

    const result: GetUsersInformationOutput = {}
    for (const userId of request.data.userIds) {
      try {
        const userData = await userService.getUser(userId)
        if (organization && userData?.content.organization !== organization)
          throw credential.permissionDeniedError()

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

    const userService: UserService = new DatabaseUserService(
      new CacheDatabaseService(new FirestoreService()),
    )
    const user = await userService.getUser(request.data.userId)
    if (!user) throw new https.HttpsError('not-found', 'User not found')
    const organization = user.content.organization

    const credential = new Credential(request.auth, userService)
    await credential.checkAny(
      ...(organization ? [UserRole.clinician(organization)] : []),
      UserRole.user(request.data.userId),
    )

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

    const userService: UserService = new DatabaseUserService(
      new CacheDatabaseService(new FirestoreService()),
    )
    const user = await userService.getUser(request.auth.uid)
    if (!user) throw new https.HttpsError('not-found', 'User not found')

    const credential = new Credential(request.auth, userService)
    await credential.checkAny(
      ...(user.content.organization ?
        [UserRole.clinician(user.content.organization)]
      : []),
    )
    await userService.deleteUser(request.data.userId)
  },
)
