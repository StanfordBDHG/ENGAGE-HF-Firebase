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
  await getServiceFactory().user().updateClaims(event.data.uid)
})
