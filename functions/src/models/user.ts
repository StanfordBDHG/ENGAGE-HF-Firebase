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

export interface User {
  type: UserType
  dateOfBirth?: string | null
  clinician?: string
  dateOfEnrollment?: string
  invitationCode?: string
  messagesSettings?: UserMessagesSettings
  organization?: string
  language?: string
  timeZone?: string
}

export interface UserAuth {
  displayName?: string
  email?: string
  phoneNumber?: string
  photoURL?: string
}
