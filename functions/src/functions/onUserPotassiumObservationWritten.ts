//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { UserObservationCollection } from '@stanfordbdhg/engagehf-models'
import { onDocumentWritten } from 'firebase-functions/firestore'
import { Env } from '../env.js'
import { defaultServiceAccount } from './helpers.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const onUserPotassiumObservationWritten = onDocumentWritten(
  {
    document: 'users/{userId}/potassiumObservations/{observationId}',
    serviceAccount: defaultServiceAccount,
    secrets: Env.twilioSecretKeys,
  },
  async (event) => {
    const factory = getServiceFactory()
    const triggerService = factory.trigger()
    await triggerService.userObservationWritten(
      event.params.userId,
      UserObservationCollection.potassium,
    )
  },
)
