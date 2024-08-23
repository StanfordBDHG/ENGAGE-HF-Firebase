//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  getUsersInformationInputSchema,
  type getUsersInformationOutputSchema,
  userConverter,
  type userInformationSchema,
} from '@stanfordbdhg/engagehf-models'
import { https } from 'firebase-functions'
import { type z } from 'zod'
import { validatedOnCall } from './helpers.js'
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const getUsersInformation = validatedOnCall(
  getUsersInformationInputSchema,
  async (request): Promise<z.input<typeof getUsersInformationOutputSchema>> => {
    if (!request.auth?.uid)
      throw new https.HttpsError('unauthenticated', 'User is not authenticated')

    const factory = getServiceFactory()
    const credential = factory.credential(request.auth)
    const userService = factory.user()

    const result: z.input<typeof getUsersInformationOutputSchema> = {}
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
        const userInformation: z.input<typeof userInformationSchema> = {
          auth: {
            displayName: user.displayName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            photoURL: user.photoURL,
          },
        }
        if (request.data.includeUserData && userData !== undefined) {
          userInformation.user = userConverter.value.encode(userData.content)
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
