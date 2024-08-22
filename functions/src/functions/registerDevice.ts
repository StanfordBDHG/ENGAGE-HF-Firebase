//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { registerDeviceInputSchema } from '@stanfordbdhg/engagehf-models'
import { validatedOnCall } from './helpers.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const registerDevice = validatedOnCall(
  registerDeviceInputSchema,
  async (request) => {
    const userId = request.auth?.uid
    if (!userId) throw new Error('User is not authenticated')
    await getServiceFactory().message().registerDevice(userId, request.data)
  },
)
