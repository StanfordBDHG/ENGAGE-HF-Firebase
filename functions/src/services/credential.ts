//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { https } from 'firebase-functions/v2'
import { type AuthData } from 'firebase-functions/v2/tasks'
import { type UserService } from './user/userService.js'
import { UserType, type User } from '../models/user.js'

enum UserRoleType {
  admin = 'admin',
  owner = 'owner',
  clinician = 'clinician',
  patient = 'patient',
  user = 'user',
}

export class UserRole {
  // Properties

  readonly type: UserRoleType
  readonly organization?: string
  readonly userId?: string

  // Constructor

  private constructor(
    type: UserRoleType,
    organization?: string,
    userId?: string,
  ) {
    this.type = type
    this.organization = organization
    this.userId = userId
  }

  // Methods

  equals(role: UserRole): boolean {
    return (
      this.type === role.type &&
      this.organization === role.organization &&
      this.userId === role.userId
    )
  }

  // Static Properties

  static readonly admin = new UserRole(UserRoleType.admin, undefined, undefined)
  static owner(organization: string): UserRole {
    return new UserRole(UserRoleType.owner, organization, undefined)
  }
  static clinician(organization: string): UserRole {
    return new UserRole(UserRoleType.clinician, organization, undefined)
  }
  static patient(organization: string): UserRole {
    return new UserRole(UserRoleType.patient, organization, undefined)
  }
  static user(userId: string): UserRole {
    return new UserRole(UserRoleType.user, undefined, userId)
  }
}

export class Credential {
  // Properties

  private readonly authData: AuthData
  private readonly user: Promise<User>
  private readonly userService: UserService

  private grantedRoles: UserRole[] = []
  private deniedRoles: UserRole[] = []

  // Constructor

  constructor(authData: AuthData | undefined, userService: UserService) {
    if (!authData)
      throw new https.HttpsError(
        'unauthenticated',
        'User is not authenticated.',
      )
    this.authData = authData
    this.userService = userService
    this.user = userService.getUser(authData.uid).then((document) => {
      if (!document) throw new https.HttpsError('not-found', 'User not found.')
      return document.content
    })
  }

  // Methods

  async checkAny(...roles: UserRole[]): Promise<void> {
    for (const role of roles) {
      if (this.grantedRoles.some((grantedRole) => grantedRole.equals(role)))
        return
    }

    for (const role of roles) {
      if (this.deniedRoles.some((deniedRole) => role.equals(deniedRole)))
        throw this.permissionDeniedError()
      if (await this.check(role)) {
        this.grantedRoles.push(role)
        return
      } else {
        this.deniedRoles.push(role)
      }
    }

    throw this.permissionDeniedError()
  }

  async checkFirst(...roles: UserRole[]): Promise<UserRole> {
    for (const role of roles) {
      if (this.grantedRoles.some((grantedRole) => grantedRole.equals(role)))
        return role
      if (this.deniedRoles.some((deniedRole) => role.equals(deniedRole)))
        throw this.permissionDeniedError()
      if (await this.check(role)) {
        this.grantedRoles.push(role)
        return role
      } else {
        this.deniedRoles.push(role)
      }
    }
    throw this.permissionDeniedError()
  }

  permissionDeniedError(): https.HttpsError {
    return new https.HttpsError(
      'permission-denied',
      'User does not have permission.',
    )
  }

  // Helpers

  private async check(role: UserRole): Promise<boolean> {
    switch (role.type) {
      case UserRoleType.admin: {
        return (await this.user).type === UserType.admin
      }
      case UserRoleType.owner: {
        const user = await this.user
        return (
          user.type === UserType.owner &&
          user.organization === role.organization
        )
      }
      case UserRoleType.clinician: {
        const user = await this.user
        return (
          user.type === UserType.clinician &&
          user.organization === role.organization
        )
      }

      case UserRoleType.patient: {
        const user = await this.user
        return (
          user.type === UserType.patient &&
          user.organization === role.organization
        )
      }
      case UserRoleType.user: {
        if (this.authData.uid !== role.userId) return false
        if (role.organization)
          return (await this.user).organization === role.organization
        else return true
      }
    }
  }
}
