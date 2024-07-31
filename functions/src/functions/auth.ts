//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import admin from 'firebase-admin'
import { https, logger } from 'firebase-functions/v2'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from 'firebase-functions/v2/identity'
import { UserType } from '../models/user.js'
import { CacheDatabaseService } from '../services/database/cacheDatabaseService.js'
import { FirestoreService } from '../services/database/firestoreService.js'
import { DatabaseUserService } from '../services/user/databaseUserService.js'
import { type UserService } from '../services/user/userService.js'

export const beforeUserCreatedFunction = beforeUserCreated(async (event) => {
  console.log('beforeUserCreatedFunction', JSON.stringify(event))
})

export const beforeUserSignedInFunction = beforeUserSignedIn(async (event) => {
  console.log('beforeUserSignedInFunction', JSON.stringify(event))
})

export const onUserWrittenFunction = onDocumentWritten(
  'users/{userId}',
  async (event) => {
    const userService = new DatabaseUserService(
      new CacheDatabaseService(new FirestoreService()),
    )
    try {
      await userService.updateClaims(event.params.userId)
    } catch (error) {
      logger.error(
        `Error processing claims update for userId '${event.params.userId}' on change of user: ${String(error)}`,
      )
    }
  },
)
