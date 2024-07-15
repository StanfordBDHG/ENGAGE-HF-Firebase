//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { type FHIRSimpleQuantity } from './fhir/baseTypes.js'

export interface UserMessagesSettings {
  dailyRemindersAreActive: boolean
  textNotificationsAreActive: boolean
  medicationRemindersAreActive: boolean
}

export interface User {
  dateOfBirth: Date
  dateOfEnrollment: Date
  invitationCode: string
  messagesSettings: UserMessagesSettings
  clinician?: string
  organization?: string
  language?: string
  timeZone?: string
  dryWeight?: FHIRSimpleQuantity
}

export interface UserRecord {
  displayName?: string
}
