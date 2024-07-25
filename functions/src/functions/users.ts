//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { https } from 'firebase-functions'
import { type CallableRequest, onCall } from 'firebase-functions/v2/https'
import { type Result } from './types.js'
import { type UserAuth, type User } from '../models/user.js'
import { Credential, UserRole } from '../services/credential.js'
import { CacheDatabaseService } from '../services/database/cacheDatabaseService.js'
import { FirestoreService } from '../services/database/firestoreService.js'
import { DatabaseUserService } from '../services/user/databaseUserService.js'
import { type UserService } from '../services/user/userService.js'

export interface GetUsersInformationInput {
  includeUserData?: boolean
  userIds?: string[]
}

export interface UserInformation {
  auth: UserAuth
  user?: User
}

export type GetUsersInformationOutput = Record<string, Result<UserInformation>>

export const getUsersInformationFunction = onCall(
  async (request: CallableRequest<GetUsersInformationInput>) => {
    if (!request.auth?.uid)
      throw new https.HttpsError('unauthenticated', 'User is not authenticated')

    if (!request.data.userIds)
      throw new https.HttpsError('invalid-argument', 'User IDs are required')

    if (request.data.userIds.length > 100)
      throw new https.HttpsError('invalid-argument', 'Too many user IDs')

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

export interface UpdateUserInformationInput {
  userId?: string
  data?: UserInformation
}

export const updateUserInformationFunction = onCall(
  async (request: CallableRequest<UpdateUserInformationInput>) => {
    if (!request.auth?.uid)
      throw new https.HttpsError('unauthenticated', 'User is not authenticated')

    if (!request.data.userId)
      throw new https.HttpsError('invalid-argument', 'User ID is required')

    if (!request.data.data)
      throw new https.HttpsError('invalid-argument', 'User data is required')

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

export interface DeleteUserInput {
  userId?: string
}

export const deleteUserFunction = onCall(
  async (request: CallableRequest<DeleteUserInput>) => {
    if (!request.auth?.uid)
      throw new https.HttpsError('unauthenticated', 'User is not authenticated')

    if (!request.data.userId)
      throw new https.HttpsError('invalid-argument', 'User ID is required')

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
    return 'Success'
  },
)
