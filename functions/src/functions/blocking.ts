//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

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
    await getServiceFactory().user().updateClaims(event.data.uid)
  } catch (error) {
    console.error(
      `beforeUserSignedIn finished with error: ${String(error)}. This is expected behavior for the troubleshooting with Firebase Support.`,
    )
  }
})
