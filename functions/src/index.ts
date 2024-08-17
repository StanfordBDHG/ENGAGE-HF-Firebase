//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

// Based on:
// https://github.com/StanfordBDHG/PediatricAppleWatchStudy/pull/54/files

import admin from 'firebase-admin'

admin.initializeApp()

export {
  beforeUserCreatedFunction as beforeUserCreated,
  beforeUserSignedInFunction as beforeUserSignedIn,
} from './functions/auth.js'
export * from './functions/device.js'
export * from './functions/healthSummary.js'
export * from './functions/history.js'
export * from './functions/invitation.js'
export * from './functions/message.js'
export * from './functions/recommendation.js'
export * from './functions/seeding.js'
export * from './functions/symptomScore.js'
export * from './functions/trigger.js'
export * from './functions/user.js'
