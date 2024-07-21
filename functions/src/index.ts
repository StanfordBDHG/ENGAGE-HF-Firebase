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
import { dismissMessageFunction } from './functions/message.js'
import { seedEmulatorFunction } from './functions/seedEmulator.js'
import { rebuildStaticDataFunction } from './functions/staticData.js'
import {
  createInvitationFunction,
  deleteUserFunction,
  getUsersInformationFunction,
  grantAdminFunction,
  grantOwnerFunction,
  revokeAdminFunction,
  revokeOwnerFunction,
  updateUserInformationFunction,
} from './functions/users.js'

admin.initializeApp()

export const beforeUserCreated = beforeUserCreatedFunction
export const checkInvitationCode = checkInvitationCodeFunction
export const dismissMessage = dismissMessageFunction
export const exportHealthSummary = exportHealthSummaryFunction
export const rebuildStaticData = rebuildStaticDataFunction

export const getUsersInformation = getUsersInformationFunction
export const updateUserInformation = updateUserInformationFunction
export const deleteUser = deleteUserFunction
export const createInvitation = createInvitationFunction
export const grantOwner = grantOwnerFunction
export const revokeOwner = revokeOwnerFunction
export const grantAdmin = grantAdminFunction
export const revokeAdmin = revokeAdminFunction

export const seedEmulator = seedEmulatorFunction
