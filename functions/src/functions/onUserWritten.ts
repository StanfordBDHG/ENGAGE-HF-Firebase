//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { logger } from 'firebase-functions'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const onUserWritten = onDocumentWritten(
  'users/{userId}',
  async (event) => {
    try {
      await getServiceFactory().user().updateClaims(event.params.userId)
    } catch (error) {
      logger.error(
        `Error processing claims update for userId '${event.params.userId}' on change of user: ${String(error)}`,
      )
    }
  },
)
