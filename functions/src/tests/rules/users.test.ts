//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { randomUUID } from 'crypto'
import fs from 'fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import type firebase from 'firebase/compat/app'
import { describe, it } from 'mocha'
import { UserType } from '../../models/types/userType.js'

describe('firestore.rules: users/{userId}', () => {
  const organizationId = 'stanford'
  const otherOrganizationId = 'jhu'

  const adminId = 'mockAdmin'
  const ownerId = 'mockOwner'
  const clinicianId = 'mockClinician'
  const patientId = 'mockPatient'
  const userId = 'mockUser'

  let testEnvironment: RulesTestEnvironment
  let adminFirestore: firebase.firestore.Firestore
  let ownerFirestore: firebase.firestore.Firestore
  let clinicianFirestore: firebase.firestore.Firestore
  let patientFirestore: firebase.firestore.Firestore
  let userFirestore: firebase.firestore.Firestore

  before(async () => {
    testEnvironment = await initializeTestEnvironment({
      projectId: 'stanford-bdhg-engage-hf',
      firestore: {
        rules: fs.readFileSync('../firestore.rules', 'utf8'),
        host: 'localhost',
        port: 8080,
      },
    })

    adminFirestore = testEnvironment
      .authenticatedContext(adminId, { type: UserType.admin })
      .firestore()

    ownerFirestore = testEnvironment
      .authenticatedContext(ownerId, {
        type: UserType.owner,
        organization: organizationId,
      })
      .firestore()

    clinicianFirestore = testEnvironment
      .authenticatedContext(clinicianId, {
        organization: organizationId,
        type: UserType.clinician,
      })
      .firestore()

    patientFirestore = testEnvironment
      .authenticatedContext(patientId, {
        organization: organizationId,
        type: UserType.patient,
      })
      .firestore()

    userFirestore = testEnvironment.authenticatedContext(userId, {}).firestore()
  })

  beforeEach(async () => {
    await testEnvironment.clearFirestore()
    await testEnvironment.withSecurityRulesDisabled(async (environment) => {
      const firestore = environment.firestore()
      await firestore.doc(`organizations/${organizationId}`).set({})
      await firestore.doc(`organizations/${otherOrganizationId}`).set({})
      await firestore.doc(`users/${adminId}`).set({ type: UserType.admin })
      await firestore
        .doc(`users/${ownerId}`)
        .set({ organization: organizationId })
      await firestore
        .doc(`users/${clinicianId}`)
        .set({ type: UserType.clinician, organization: organizationId })
      await firestore
        .doc(`users/${patientId}`)
        .set({ type: UserType.patient, organization: organizationId })
      await firestore.doc(`users/${userId}`).set({})
    })
  })

  after(async () => {
    await testEnvironment.cleanup()
  })

  it('gets users/{userId}', async () => {
    await assertSucceeds(adminFirestore.doc(`users/${adminId}`).get())
    await assertSucceeds(adminFirestore.doc(`users/${ownerId}`).get())
    await assertSucceeds(adminFirestore.doc(`users/${clinicianId}`).get())
    await assertSucceeds(adminFirestore.doc(`users/${patientId}`).get())
    await assertSucceeds(adminFirestore.doc(`users/${userId}`).get())

    await assertFails(ownerFirestore.doc(`users/${adminId}`).get())
    await assertSucceeds(ownerFirestore.doc(`users/${ownerId}`).get())
    await assertSucceeds(ownerFirestore.doc(`users/${clinicianId}`).get())
    await assertSucceeds(ownerFirestore.doc(`users/${patientId}`).get())
    await assertFails(ownerFirestore.doc(`users/${userId}`).get())

    await assertFails(clinicianFirestore.doc(`users/${adminId}`).get())
    await assertSucceeds(clinicianFirestore.doc(`users/${ownerId}`).get())
    await assertSucceeds(clinicianFirestore.doc(`users/${clinicianId}`).get())
    await assertSucceeds(clinicianFirestore.doc(`users/${patientId}`).get())
    await assertFails(clinicianFirestore.doc(`users/${userId}`).get())

    await assertFails(patientFirestore.doc(`users/${adminId}`).get())
    await assertFails(patientFirestore.doc(`users/${ownerId}`).get())
    await assertFails(patientFirestore.doc(`users/${clinicianId}`).get())
    await assertSucceeds(patientFirestore.doc(`users/${patientId}`).get())
    await assertFails(patientFirestore.doc(`users/${userId}`).get())

    await assertFails(userFirestore.doc(`users/${adminId}`).get())
    await assertFails(userFirestore.doc(`users/${ownerId}`).get())
    await assertFails(userFirestore.doc(`users/${clinicianId}`).get())
    await assertFails(userFirestore.doc(`users/${patientId}`).get())
    await assertSucceeds(userFirestore.doc(`users/${userId}`).get())
  })

  it('lists users', async () => {
    await assertSucceeds(adminFirestore.collection('users').get())

    await assertFails(ownerFirestore.collection('users').get())
    await assertSucceeds(
      ownerFirestore
        .collection('users')
        .where('organization', '==', organizationId)
        .get(),
    )

    await assertFails(
      testEnvironment
        .authenticatedContext(ownerId, {
          type: UserType.owner,
          organization: otherOrganizationId,
        })
        .firestore()
        .collection('users')
        .where('organization', '==', organizationId)
        .get(),
    )

    await assertFails(clinicianFirestore.collection('users').get())
    await assertSucceeds(
      clinicianFirestore
        .collection('users')
        .where('organization', '==', organizationId)
        .get(),
    )

    await assertFails(
      testEnvironment
        .authenticatedContext(clinicianId, {
          type: UserType.clinician,
          organization: otherOrganizationId,
        })
        .firestore()
        .collection('users')
        .where('organization', '==', organizationId)
        .get(),
    )

    await assertFails(patientFirestore.collection('users').get())
    await assertFails(
      patientFirestore
        .collection('users')
        .where('organization', '==', organizationId)
        .get(),
    )

    await assertFails(userFirestore.collection('users').get())
    await assertFails(
      userFirestore
        .collection('users')
        .where('organization', '==', organizationId)
        .get(),
    )
  })

  it('creates users/{userId}', async () => {
    await assertSucceeds(adminFirestore.doc(`users/${randomUUID()}`).set({}))
    await assertFails(ownerFirestore.doc(`users/${randomUUID()}`).set({}))
    await assertFails(clinicianFirestore.doc(`users/${randomUUID()}`).set({}))
    await assertFails(patientFirestore.doc(`users/${randomUUID()}`).set({}))
    await assertFails(userFirestore.doc(`users/${randomUUID()}`).set({}))

    await testEnvironment.withSecurityRulesDisabled(async (environment) => {
      await environment.firestore().doc(`users/${userId}`).delete()
    })
    await assertSucceeds(userFirestore.doc(`users/${userId}`).set({}))
  })

  it('updates users/{userId} as admin', async () => {
    await assertSucceeds(adminFirestore.doc(`users/${adminId}`).set({}))
    await assertSucceeds(adminFirestore.doc(`users/${ownerId}`).set({}))
    await assertSucceeds(
      adminFirestore
        .doc(`users/${ownerId}`)
        .set({ type: UserType.admin, organization: otherOrganizationId }),
    )
    await assertSucceeds(
      adminFirestore
        .doc(`users/${clinicianId}`)
        .set({ type: UserType.patient, organization: otherOrganizationId }),
    )
    await assertSucceeds(adminFirestore.doc(`users/${patientId}`).set({}))
    await assertSucceeds(adminFirestore.doc(`users/${userId}`).set({}))
  })

  it('updates users/{userId} as owner', async () => {
    await assertFails(ownerFirestore.doc(`users/${adminId}`).set({}))
    await assertFails(ownerFirestore.doc(`users/${ownerId}`).set({}))
    await assertFails(
      ownerFirestore
        .doc(`users/${clinicianId}`)
        .set({ dateOfBirth: new Date('2011-01-01').toISOString() }),
    )
    await assertFails(
      ownerFirestore
        .doc(`users/${clinicianId}`)
        .set(
          { dateOfBirth: new Date('2011-01-01').toISOString() },
          { merge: false },
        ),
    )
    await assertFails(
      ownerFirestore.doc(`users/${clinicianId}`).set(
        {
          type: UserType.patient,
          dateOfBirth: new Date('2011-01-01').toISOString(),
        },
        { merge: false },
      ),
    )
    await assertSucceeds(
      ownerFirestore
        .doc(`users/${clinicianId}`)
        .set(
          { dateOfBirth: new Date('2011-01-01').toISOString() },
          { merge: true },
        ),
    )
    console.log('patient')
    await assertSucceeds(
      ownerFirestore
        .doc(`users/${patientId}`)
        .set(
          { dateOfBirth: new Date('2011-01-01').toISOString() },
          { merge: true },
        ),
    )
    await assertFails(
      ownerFirestore
        .doc(`users/${userId}`)
        .set(
          { dateOfBirth: new Date('2011-01-01').toISOString() },
          { merge: true },
        ),
    )
  })
})
