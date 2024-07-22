//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { type Admin, type Clinician, type Patient, type User } from './user.js'
import { type UserAuthenticationInformation } from '../services/auth/authService.js'

export interface Invitation {
  userId?: string

  auth?: UserAuthenticationInformation
  admin?: Admin
  clinician?: Clinician
  patient?: Patient
  user?: User
}
