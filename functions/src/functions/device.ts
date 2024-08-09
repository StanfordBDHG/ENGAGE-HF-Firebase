//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { validatedOnCall } from './helpers.js'
import { UserDevicePlatform } from '../models/device.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

const registerDeviceInputSchema = z.object({
  notificationToken: z.string(),
  platform: z.nativeEnum(UserDevicePlatform),
  osVersion: z.string().or(z.null()).default(null),
  appVersion: z.string().or(z.null()).default(null),
  appBuild: z.string().or(z.null()).default(null),
  language: z.string().or(z.null()).default(null),
  timeZone: z.string().or(z.null()).default(null),
})

export const registerDevice = validatedOnCall(
  registerDeviceInputSchema,
  async (request) => {
    const userId = request.auth?.uid
    if (!userId) throw new Error('User is not authenticated')
    await getServiceFactory().message().registerDevice(userId, request.data)
  },
)
