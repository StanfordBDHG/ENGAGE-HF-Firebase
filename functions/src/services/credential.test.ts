//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import { type AuthData } from 'firebase-functions/v2/tasks'
import { describe } from 'mocha'
import { Credential, UserRole } from './credential.js'
import { UserType } from '../models/user.js'
import { setupMockAuth, setupMockFirestore } from '../tests/setup.js'
import { DatabaseUserService } from './user/databaseUserService.js'
import { FirestoreService } from './database/firestoreService.js'
import { MockFirestore } from '../tests/mocks/firestore.js'
import { UserService } from './user/userService.js'

describe('Credential', () => {
  let mockFirestore: MockFirestore
  let userService: UserService

  beforeEach(() => {
    setupMockAuth()
    mockFirestore = setupMockFirestore()
    userService = new DatabaseUserService(new FirestoreService())
  })

  function createAuthData(userId: string): AuthData {
    return { uid: userId } as AuthData
  }

  const adminAuth = createAuthData('mockAdmin')
  const ownerAuth = createAuthData('mockOwner')
  const clinicianAuth = createAuthData('mockClinician')
  const patientAuth = createAuthData('mockPatient')
  const organizationId = 'mockOrganization'
  const otherOrganizationId = 'otherOrganization'

  beforeEach(() => {
    mockFirestore.collections = {
      organizations: {
        mockOrganization: {
          owners: ['mockOwner'],
        },
        otherOrganization: {
          owners: [],
        },
      },
      users: {
        mockAdmin: {
          type: UserType.admin,
        },
        mockClinician: {
          type: UserType.clinician,
          organization: 'mockOrganization',
        },
        mockOwner: {
          organization: 'mockOrganization',
        },
        mockPatient: {
          type: UserType.patient,
          organization: 'mockOrganization',
        },
      },
    }
  })

  it('correctly understands whether a user is an admin', async () => {
    const credential = new Credential(adminAuth, userService)

    await expectToNotThrow(() => credential.checkAny(UserRole.admin))

    await expectToThrow(
      () => credential.checkAny(UserRole.owner(organizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.owner(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.clinician(organizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.clinician(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.patient(organizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.patient(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToNotThrow(() =>
      credential.checkAny(UserRole.user(adminAuth.uid)),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.user(patientAuth.uid)),
      credential.permissionDeniedError(),
    )
  })

  it('correctly understands whether a user is an owner', async () => {
    const credential = new Credential(ownerAuth, userService)

    await expectToThrow(
      () => credential.checkAny(UserRole.admin),
      credential.permissionDeniedError(),
    )

    await expectToNotThrow(() =>
      credential.checkAny(UserRole.owner(organizationId)),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.owner(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.clinician(organizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.clinician(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.patient(organizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.patient(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToNotThrow(() =>
      credential.checkAny(UserRole.user(ownerAuth.uid)),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.user(patientAuth.uid)),
      credential.permissionDeniedError(),
    )
  })

  it('correctly understands whether a user is a clinician', async () => {
    const credential = new Credential(clinicianAuth, userService)

    await expectToThrow(
      () => credential.checkAny(UserRole.admin),
      credential.permissionDeniedError(),
    )

    await expectToThrow(() =>
      credential.checkAny(UserRole.owner(organizationId)),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.owner(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToNotThrow(() =>
      credential.checkAny(UserRole.clinician(organizationId)),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.clinician(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.patient(organizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.patient(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToNotThrow(() =>
      credential.checkAny(UserRole.user(clinicianAuth.uid)),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.user(patientAuth.uid)),
      credential.permissionDeniedError(),
    )
  })

  it('correctly understands whether a user is a patient', async () => {
    const credential = new Credential(patientAuth, userService)

    await expectToThrow(
      () => credential.checkAny(UserRole.admin),
      credential.permissionDeniedError(),
    )

    await expectToThrow(() =>
      credential.checkAny(UserRole.owner(organizationId)),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.owner(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.clinician(organizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.clinician(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToNotThrow(() =>
      credential.checkAny(UserRole.patient(organizationId)),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.patient(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToNotThrow(() =>
      credential.checkAny(UserRole.user(patientAuth.uid)),
    )

    await expectToThrow(
      () => credential.checkAny(UserRole.user(ownerAuth.uid)),
      credential.permissionDeniedError(),
    )
  })
})

async function expectToThrow(
  promise: () => Promise<void>,
  error?: unknown,
  message?: string,
): Promise<void> {
  try {
    await promise()
    expect.fail('Expected promise to throw')
  } catch (e) {
    if (error !== undefined) expect(e).to.deep.equal(error, message)
  }
}

async function expectToNotThrow<T>(
  promise: () => Promise<T>,
  message?: string,
): Promise<T> {
  try {
    return await promise()
  } catch (e) {
    expect.fail('Expected promise to not throw', message)
  }
}
