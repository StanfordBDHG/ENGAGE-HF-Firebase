//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import fs from 'fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import type firebase from 'firebase/compat/app'
import { describe, it } from 'mocha'
import { UserType } from '../../models/user.js'

describe('firestore.rules: invitations/{invitationCode}', () => {
  const organizationId = 'stanford'
  const otherOrganizationId = 'jhu'
  const nonExistingOrganizationId = 'ucb'

  const adminId = 'mockAdmin'
  const ownerId = 'mockOwner'
  const clinicianId = 'mockClinician'
  const patientId = 'mockPatient'
  const userId = 'mockUser'

  const adminInvitationCode = 'admin@stanford.edu'
  const ownerInvitationCode = 'owner@stanford.edu'
  const clinicianInvitationCode = 'clinician@stanford.edu'
  const patientInvitationCode = 'PATIENT01'
  const userInvitationCode = 'USER1234'

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
      .authenticatedContext(adminId, {
        type: UserType.admin,
        organization: null,
        isOwner: false,
      })
      .firestore()

    ownerFirestore = testEnvironment
      .authenticatedContext(ownerId, {
        type: null,
        organization: organizationId,
        isOwner: true,
      })
      .firestore()

    clinicianFirestore = testEnvironment
      .authenticatedContext(clinicianId, {
        type: UserType.clinician,
        organization: organizationId,
        isOwner: false,
      })
      .firestore()

    patientFirestore = testEnvironment
      .authenticatedContext(patientId, {
        type: UserType.patient,
        organization: organizationId,
        isOwner: false,
      })
      .firestore()

    userFirestore = testEnvironment
      .authenticatedContext(userId, {
        type: null,
        organization: null,
        isOwner: false,
      })
      .firestore()
  })

  beforeEach(async () => {
    await testEnvironment.clearFirestore()
    await testEnvironment.withSecurityRulesDisabled(async (environment) => {
      const firestore = environment.firestore()
      await firestore
        .doc(`organizations/${organizationId}`)
        .set({ owners: [ownerId] })
      await firestore
        .doc(`organizations/${otherOrganizationId}`)
        .set({ owners: [] })
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
      await firestore.doc(`invitations/${adminInvitationCode}`).set({
        auth: { displayName: 'admin' },
        user: { type: UserType.admin },
      })
      await firestore.doc(`invitations/${ownerFirestore}`).set({
        auth: { displayName: 'owner' },
        user: { organization: organizationId },
      })
      await firestore.doc(`invitations/${clinicianInvitationCode}`).set({
        user: { type: UserType.clinician, organization: organizationId },
      })
      await firestore.doc(`invitations/${patientInvitationCode}`).set({
        user: { type: UserType.patient, organization: organizationId },
      })
      await firestore.doc(`invitations/${userInvitationCode}`).set({
        user: {},
      })
    })
  })

  after(async () => {
    await testEnvironment.cleanup()
  })

  it('gets invitations/{invitationCode}', async () => {
    await assertSucceeds(
      adminFirestore.doc(`invitations/${adminInvitationCode}`).get(),
    )
    await assertSucceeds(
      adminFirestore.doc(`invitations/${ownerInvitationCode}`).get(),
    )
    await assertSucceeds(
      adminFirestore.doc(`invitations/${clinicianInvitationCode}`).get(),
    )
    await assertSucceeds(
      adminFirestore.doc(`invitations/${patientInvitationCode}`).get(),
    )
    await assertSucceeds(
      adminFirestore.doc(`invitations/${userInvitationCode}`).get(),
    )

    await assertFails(
      ownerFirestore.doc(`invitations/${adminInvitationCode}`).get(),
    )
    await assertSucceeds(
      ownerFirestore.doc(`invitations/${ownerInvitationCode}`).get(),
    )
    await assertSucceeds(
      ownerFirestore.doc(`invitations/${clinicianInvitationCode}`).get(),
    )
    await assertSucceeds(
      ownerFirestore.doc(`invitations/${patientInvitationCode}`).get(),
    )
    await assertFails(
      ownerFirestore.doc(`invitations/${userInvitationCode}`).get(),
    )

    console.log('clinician')
    await assertFails(
      clinicianFirestore.doc(`invitations/${adminInvitationCode}`).get(),
    )
    await assertSucceeds(
      clinicianFirestore.doc(`invitations/${ownerInvitationCode}`).get(),
    )
    await assertSucceeds(
      clinicianFirestore.doc(`invitations/${clinicianInvitationCode}`).get(),
    )
    await assertSucceeds(
      clinicianFirestore.doc(`invitations/${patientInvitationCode}`).get(),
    )
    await assertFails(
      clinicianFirestore.doc(`invitations/${userInvitationCode}`).get(),
    )

    await assertFails(
      patientFirestore.doc(`invitations/${adminInvitationCode}`).get(),
    )
    await assertFails(
      patientFirestore.doc(`invitations/${ownerInvitationCode}`).get(),
    )
    await assertFails(
      patientFirestore.doc(`invitations/${clinicianInvitationCode}`).get(),
    )
    await assertFails(
      patientFirestore.doc(`invitations/${patientInvitationCode}`).get(),
    )
    await assertFails(
      patientFirestore.doc(`invitations/${userInvitationCode}`).get(),
    )

    await assertFails(
      userFirestore.doc(`invitations/${adminInvitationCode}`).get(),
    )
    await assertFails(
      userFirestore.doc(`invitations/${ownerInvitationCode}`).get(),
    )
    await assertFails(
      userFirestore.doc(`invitations/${clinicianInvitationCode}`).get(),
    )
    await assertFails(
      userFirestore.doc(`invitations/${patientInvitationCode}`).get(),
    )
    await assertFails(
      userFirestore.doc(`invitations/${userInvitationCode}`).get(),
    )
  })

  it('lists invitations', async () => {
    await assertSucceeds(adminFirestore.collection('invitations').get())
    await assertFails(ownerFirestore.collection('invitations').get())
    await assertSucceeds(
      ownerFirestore
        .collection('invitations')
        .where('user.organization', '==', organizationId)
        .get(),
    )
    await assertFails(clinicianFirestore.collection('invitations').get())
    await assertSucceeds(
      clinicianFirestore
        .collection('invitations')
        .where('user.organization', '==', organizationId)
        .get(),
    )
    await assertFails(patientFirestore.collection('invitations').get())
    await assertFails(
      patientFirestore
        .collection('invitations')
        .where('user.organization', '==', organizationId)
        .get(),
    )
    await assertFails(userFirestore.collection('invitations').get())
    await assertFails(
      userFirestore
        .collection('invitations')
        .where('user.organization', '==', organizationId)
        .get(),
    )
  })

  it('creates invitations/{invitationCode}', async () => {
    await assertSucceeds(
      adminFirestore.doc(`organizations/${nonExistingOrganizationId}`).set({}),
    )
    await assertSucceeds(
      adminFirestore.doc(`organizations/${nonExistingOrganizationId}`).delete(),
    )
    await assertFails(
      ownerFirestore.doc(`organizations/${nonExistingOrganizationId}`).set({}),
    )
    await assertFails(
      clinicianFirestore
        .doc(`organizations/${nonExistingOrganizationId}`)
        .set({}),
    )
    await assertFails(
      patientFirestore
        .doc(`organizations/${nonExistingOrganizationId}`)
        .set({}),
    )
    await assertFails(
      userFirestore.doc(`organizations/${nonExistingOrganizationId}`).set({}),
    )
  })

  it('updates organizations/{organizationsId} owners', async () => {
    await assertSucceeds(
      adminFirestore
        .doc(`organizations/${organizationId}`)
        .set({ owners: [clinicianId] }, { merge: true }),
    )
    await assertSucceeds(
      adminFirestore
        .doc(`organizations/${organizationId}`)
        .set({ owners: [ownerId] }, { merge: true }),
    )
    await assertSucceeds(
      ownerFirestore
        .doc(`organizations/${organizationId}`)
        .set({ owners: [clinicianId] }, { merge: true }),
    )
    await assertSucceeds(
      adminFirestore
        .doc(`organizations/${organizationId}`)
        .set({ owners: [ownerId] }, { merge: true }),
    )
    await assertFails(
      clinicianFirestore
        .doc(`organizations/${organizationId}`)
        .set({ owners: [clinicianId] }, { merge: true }),
    )
    await assertFails(
      patientFirestore
        .doc(`organizations/${organizationId}`)
        .set({ owners: [patientId] }, { merge: true }),
    )
    await assertFails(
      userFirestore
        .doc(`organizations/${organizationId}`)
        .set({ owners: [userId] }, { merge: true }),
    )
  })
})
