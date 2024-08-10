//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

export interface UserMessagesSettings {
  dailyRemindersAreActive?: boolean
  textNotificationsAreActive?: boolean
  medicationRemindersAreActive?: boolean
}

export enum UserType {
  admin = 'admin',
  owner = 'owner',
  clinician = 'clinician',
  patient = 'patient',
}

export interface UserRegistration {
  type: UserType
  organization?: string

  dateOfBirth?: string
  clinician?: string

  messagesSettings?: UserMessagesSettings

  language?: string
  timeZone?: string
}

export interface User extends UserRegistration {
  dateOfEnrollment: string
  invitationCode: string
}
