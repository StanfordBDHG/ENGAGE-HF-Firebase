//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { type UserRegistration } from './user.js'

export interface Invitation {
  userId?: string

  auth?: UserAuth
  user: UserRegistration
}

export interface UserAuth {
  displayName?: string
  email?: string
  phoneNumber?: string
  photoURL?: string
}
