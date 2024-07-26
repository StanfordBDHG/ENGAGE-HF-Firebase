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
import {
  beforeUserCreatedFunction,
  beforeUserSignedInFunction,
  onOrganizationWrittenFunction,
  onUserWrittenFunction,
} from './functions/auth.js'
import { exportHealthSummaryFunction } from './functions/healthSummary.js'
import {
  checkInvitationCodeFunction,
  createInvitationFunction,
} from './functions/invitation.js'
import { dismissMessageFunction } from './functions/message.js'
import { rebuildStaticDataFunction } from './functions/staticData.js'
import {
  deleteUserFunction,
  getUsersInformationFunction,
  updateUserInformationFunction,
} from './functions/users.js'

admin.initializeApp()

// auth

export const beforeUserCreated = beforeUserCreatedFunction
export const beforeUserSignedIn = beforeUserSignedInFunction
export const onOrganizationWritten = onOrganizationWrittenFunction
export const onUserWritten = onUserWrittenFunction

// healthSummary

export const exportHealthSummary = exportHealthSummaryFunction

// invitation

export const createInvitation = createInvitationFunction
export const checkInvitationCode = checkInvitationCodeFunction

// message

export const dismissMessage = dismissMessageFunction

// staticData

export const rebuildStaticData = rebuildStaticDataFunction

// users

export const getUsersInformation = getUsersInformationFunction
export const deleteUser = deleteUserFunction
export const updateUserInformation = updateUserInformationFunction
