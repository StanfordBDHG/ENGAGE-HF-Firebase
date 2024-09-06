//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { logger } from 'firebase-functions'
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from 'firebase-functions/v2/identity'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const beforeUserCreatedFunction = beforeUserCreated((event) => {
  console.log(`beforeUserCreated with event: ${JSON.stringify(event)}`)
})

export const beforeUserSignedInFunction = beforeUserSignedIn(async (event) => {
  try {
    const userService = getServiceFactory().user()
    await userService.updateClaims(event.data.uid)
    logger.info(`beforeUserSignedIn finished successfully.`)
  } catch (error) {
    logger.error(`beforeUserSignedIn finished with error: ${String(error)}`)
  }
})
