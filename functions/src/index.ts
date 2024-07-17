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
import { rebuildStaticDataFunction } from './functions/staticData.js'
import {
  createClinicianInvitationFunction,
  createPatientInvitationFunction,
  deleteUserFunction,
  getAuthenticationsFunction,
  makeAdminFunction,
  makeOwnerFunction,
  removeAdminFunction,
  removeOwnerFunction,
  updateAuthenticationFunction,
} from './functions/users.js'

admin.initializeApp()

export const beforeUserCreated = beforeUserCreatedFunction
export const checkInvitationCode = checkInvitationCodeFunction
export const dismissMessage = dismissMessageFunction
export const exportHealthSummary = exportHealthSummaryFunction
export const rebuildStaticData = rebuildStaticDataFunction

export const getAuthentications = getAuthenticationsFunction
export const updateAuthentication = updateAuthenticationFunction
export const deleteUser = deleteUserFunction
export const createClinicianInvitation = createClinicianInvitationFunction
export const createPatientInvitation = createPatientInvitationFunction
export const makeOwner = makeOwnerFunction
export const removeOwner = removeOwnerFunction
export const makeAdmin = makeAdminFunction
export const removeAdmin = removeAdminFunction
