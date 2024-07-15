//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type QuantityObservation } from './vitals.js'

export interface UserMessagesSettings {
  dailyRemindersAreActive?: boolean
  textNotificationsAreActive?: boolean
  medicationRemindersAreActive?: boolean
}

export interface Admin {}

export interface Clinician {}

export interface Patient {
  dateOfBirth: Date
  clinician?: string
  creatinine?: QuantityObservation
  dryWeight?: QuantityObservation
  estimatedGlomerularFiltrationRate?: QuantityObservation
  potassium?: QuantityObservation
}

export interface User {
  dateOfEnrollment: Date
  invitationCode: string
  messagesSettings?: UserMessagesSettings
  organization?: string
  language?: string
  timeZone?: string
}

export interface UserRecord {
  displayName?: string
}
