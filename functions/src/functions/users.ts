//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import admin from 'firebase-admin'
import { https } from 'firebase-functions'
import { type CallableRequest, onCall } from 'firebase-functions/v2/https'
import { type Result } from './types.js'
import { type UserAuth, type User, UserType } from '../models/user.js'
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

export interface CreateInvitationInput {
  auth?: UserAuth
  user?: User
}

export interface CreateInvitationOutput {
  code: string
}

export const createInvitationFunction = onCall(
  async (request: CallableRequest<CreateInvitationInput>) => {
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

    const firestore = admin.firestore()
    const invitationCollection = firestore.collection('invitations')
    const invitationCode =
      (
        request.data.user.type === UserType.admin ||
        request.data.user.type === UserType.clinician
      ) ?
        request.data.auth.email
      : undefined

    if (invitationCode) {
      const invitationDoc = invitationCollection.doc(invitationCode)
      await invitationDoc.create(request.data)
      return { code: invitationDoc.id }
    } else {
      for (let counter = 0; ; counter++) {
        const invitationCode = generateInvitationCode(8)
        const invitationDoc = invitationCollection.doc(invitationCode)
        try {
          await invitationDoc.create(request.data)
          return { code: invitationDoc.id }
        } catch (error) {
          if (counter < 4) continue
          throw error
        }
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
