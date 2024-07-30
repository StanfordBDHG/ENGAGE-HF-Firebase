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
import { FirestoreService } from './database/firestoreService.js'
import { DatabaseUserService, UserClaims } from './user/databaseUserService.js'
import { type UserService } from './user/userService.js'
import { UserType } from '../models/user.js'
import { type MockFirestore } from '../tests/mocks/firestore.js'
import { setupMockAuth, setupMockFirestore } from '../tests/setup.js'
import { getServiceFactory } from './factory/getServiceFactory.js'
import { ServiceFactory } from './factory/serviceFactory.js'
import { DecodedIdToken } from 'firebase-admin/auth'

describe('Credential', () => {
  let mockFirestore: MockFirestore
  let serviceFactory: ServiceFactory

  beforeEach(() => {
    setupMockAuth()
    mockFirestore = setupMockFirestore()
    serviceFactory = getServiceFactory()
  })

  function createAuthData(userId: string, claims: UserClaims): AuthData {
    return {
      uid: userId,
      token: claims as unknown as DecodedIdToken,
    } as AuthData
  }

  const organizationId = 'mockOrganization'
  const otherOrganizationId = 'otherOrganization'
  const adminAuth = createAuthData('mockAdmin', {
    type: UserType.admin,
    organization: null,
  })
  const ownerAuth = createAuthData('mockOwner', {
    type: UserType.owner,
    organization: organizationId,
  })
  const clinicianAuth = createAuthData('mockClinician', {
    type: UserType.clinician,
    organization: organizationId,
  })
  const patientAuth = createAuthData('mockPatient', {
    type: UserType.patient,
    organization: organizationId,
  })

  beforeEach(() => {
    mockFirestore.replaceAll({
      organizations: {
        mockOrganization: {},
        otherOrganization: {},
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
          type: UserType.owner,
          organization: 'mockOrganization',
        },
        mockPatient: {
          type: UserType.patient,
          organization: 'mockOrganization',
        },
      },
    })
  })

  it('correctly understands whether a user is an admin', async () => {
    const credential = serviceFactory.credential(adminAuth)

    await expectToNotThrow(() => credential.check(UserRole.admin))

    await expectToThrow(
      () => credential.check(UserRole.owner(organizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.check(UserRole.owner(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.check(UserRole.clinician(organizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.check(UserRole.clinician(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.check(UserRole.patient(organizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.check(UserRole.patient(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToNotThrow(() => credential.check(UserRole.user(adminAuth.uid)))

    await expectToThrow(
      () => credential.check(UserRole.user(patientAuth.uid)),
      credential.permissionDeniedError(),
    )
  })

  it('correctly understands whether a user is an owner', async () => {
    const credential = serviceFactory.credential(ownerAuth)

    await expectToThrow(
      () => credential.check(UserRole.admin),
      credential.permissionDeniedError(),
    )

    await expectToNotThrow(() =>
      credential.check(UserRole.owner(organizationId)),
    )

    await expectToThrow(
      () => credential.check(UserRole.owner(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.check(UserRole.clinician(organizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.check(UserRole.clinician(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.check(UserRole.patient(organizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.check(UserRole.patient(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToNotThrow(() => credential.check(UserRole.user(ownerAuth.uid)))

    await expectToThrow(
      () => credential.check(UserRole.user(patientAuth.uid)),
      credential.permissionDeniedError(),
    )
  })

  it('correctly understands whether a user is a clinician', async () => {
    const credential = serviceFactory.credential(clinicianAuth)

    await expectToThrow(
      () => credential.check(UserRole.admin),
      credential.permissionDeniedError(),
    )

    await expectToThrow(() => credential.check(UserRole.owner(organizationId)))

    await expectToThrow(
      () => credential.check(UserRole.owner(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToNotThrow(() =>
      credential.check(UserRole.clinician(organizationId)),
    )

    await expectToThrow(
      () => credential.check(UserRole.clinician(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.check(UserRole.patient(organizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.check(UserRole.patient(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToNotThrow(() =>
      credential.check(UserRole.user(clinicianAuth.uid)),
    )

    await expectToThrow(
      () => credential.check(UserRole.user(patientAuth.uid)),
      credential.permissionDeniedError(),
    )
  })

  it('correctly understands whether a user is a patient', async () => {
    const credential = serviceFactory.credential(patientAuth)

    await expectToThrow(
      () => credential.check(UserRole.admin),
      credential.permissionDeniedError(),
    )

    await expectToThrow(() => credential.check(UserRole.owner(organizationId)))

    await expectToThrow(
      () => credential.check(UserRole.owner(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.check(UserRole.clinician(organizationId)),
      credential.permissionDeniedError(),
    )

    await expectToThrow(
      () => credential.check(UserRole.clinician(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToNotThrow(() =>
      credential.check(UserRole.patient(organizationId)),
    )

    await expectToThrow(
      () => credential.check(UserRole.patient(otherOrganizationId)),
      credential.permissionDeniedError(),
    )

    await expectToNotThrow(() =>
      credential.check(UserRole.user(patientAuth.uid)),
    )

    await expectToThrow(
      () => credential.check(UserRole.user(ownerAuth.uid)),
      credential.permissionDeniedError(),
    )
  })
})

async function expectToThrow<T>(
  promise: () => Promise<T> | T,
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
  promise: () => Promise<T> | T,
  message?: string,
): Promise<T> {
  try {
    return await promise()
  } catch (e) {
    expect.fail('Expected promise to not throw', message)
  }
}
