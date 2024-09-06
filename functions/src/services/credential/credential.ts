//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { UserType } from '@stanfordbdhg/engagehf-models'
import { https } from 'firebase-functions/v2'
import { type AuthData } from 'firebase-functions/v2/tasks'

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
  // Stored Properties

  private readonly authData: AuthData

  // Computed Properties

  get userId(): string {
    return this.authData.uid
  }

  // Constructor

  constructor(authData: AuthData | undefined) {
    if (!authData)
      throw new https.HttpsError(
        'unauthenticated',
        'User is not authenticated.',
      )
    this.authData = authData
  }

  // Methods

  check(...roles: UserRole[]): UserRole {
    const role = roles.find((role) => this.checkSingle(role))
    if (role !== undefined) return role
    throw this.permissionDeniedError()
  }

  async checkAsync(
    ...promises: (() => Promise<UserRole[]>)[]
  ): Promise<UserRole> {
    for (const promise of promises) {
      const roles = await promise()
      const role = roles.find((role) => this.checkSingle(role))
      if (role !== undefined) return role
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

  private checkSingle(role: UserRole): boolean {
    switch (role.type) {
      case UserRoleType.admin: {
        return this.authData.token.type === UserType.admin
      }
      case UserRoleType.owner: {
        return (
          this.authData.token.type === UserType.owner &&
          this.authData.token.organization === role.organization
        )
      }
      case UserRoleType.clinician: {
        return (
          this.authData.token.type === UserType.clinician &&
          this.authData.token.organization === role.organization
        )
      }
      case UserRoleType.patient: {
        return (
          this.authData.token.type === UserType.patient &&
          this.authData.token.organization === role.organization
        )
      }
      case UserRoleType.user: {
        return this.authData.uid === role.userId
      }
    }
  }
}
