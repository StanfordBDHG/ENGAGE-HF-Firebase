//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { unregisterDeviceInputSchema } from '@stanfordbdhg/engagehf-models'
import { https } from 'firebase-functions'
import { validatedOnCall } from './helpers.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const unregisterDevice = validatedOnCall(
  unregisterDeviceInputSchema,
  async (request) => {
    const userId = request.auth?.uid
    if (userId === undefined)
      throw new https.HttpsError('unauthenticated', 'User is not authenticated')
    await getServiceFactory()
      .message()
      .unregisterDevice(
        userId,
        request.data.notificationToken,
        request.data.platform,
      )
  },
)
