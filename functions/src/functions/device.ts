//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { validatedOnCall } from './helpers.js'
import { optionalish } from '../models/helpers/optionalish.js'
import { UserDevice, UserDevicePlatform } from '../models/types/userDevice.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

const registerDeviceInputSchema = z.object({
  notificationToken: z.string(),
  platform: z.nativeEnum(UserDevicePlatform),
  osVersion: optionalish(z.string()),
  appVersion: optionalish(z.string()),
  appBuild: optionalish(z.string()),
  language: optionalish(z.string()),
  timeZone: optionalish(z.string()),
})

export const registerDevice = validatedOnCall(
  registerDeviceInputSchema,
  async (request) => {
    const userId = request.auth?.uid
    if (!userId) throw new Error('User is not authenticated')
    await getServiceFactory()
      .message()
      .registerDevice(userId, new UserDevice(request.data))
  },
)
