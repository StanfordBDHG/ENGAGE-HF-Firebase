//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { type Admin, type Clinician, type Patient, type User } from './user.js'

export interface Invitation {
  userId?: string

  auth?: UserAuthenticationInformation
  admin?: Admin
  clinician?: Clinician
  patient?: Patient
  user?: User
}

export interface UserAuthenticationInformation {
  displayName?: string
  email?: string
  phoneNumber?: string
  photoURL?: string
}
