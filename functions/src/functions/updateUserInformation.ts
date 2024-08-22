//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { updateUserInformationInputSchema } from '@stanfordbdhg/engagehf-models'
import { https } from 'firebase-functions'
import { validatedOnCall } from './helpers.js'
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const updateUserInformation = validatedOnCall(
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
