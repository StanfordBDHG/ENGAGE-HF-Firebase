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
import { exportHealthSummaryFunction } from './functions/healthSummary.js'
import {
  beforeUserCreatedFunction,
  checkInvitationCodeFunction,
} from './functions/invitation.js'
import { didDismissMessageFunction } from './functions/message.js'
import { rebuildStaticDataFunction } from './functions/staticData.js'

admin.initializeApp()

export const beforeUserCreated = beforeUserCreatedFunction
export const checkInvitationCode = checkInvitationCodeFunction
export const didDismissMessage = didDismissMessageFunction
export const exportHealthSummary = exportHealthSummaryFunction
export const rebuildStaticData = rebuildStaticDataFunction
