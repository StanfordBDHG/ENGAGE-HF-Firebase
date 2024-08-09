//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { type UserAuth, type User } from './user.js'

export interface Invitation {
  userId?: string

  code: string

  auth?: UserAuth
  user: User
}
