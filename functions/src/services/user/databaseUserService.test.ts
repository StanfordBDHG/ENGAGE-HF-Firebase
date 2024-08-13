//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { assert, expect } from 'chai'
import admin from 'firebase-admin'
import { FieldValue, type Firestore } from 'firebase-admin/firestore'
import { describe } from 'mocha'
import { type UserService } from './userService.js'
import { UserType, type User } from '../../models/user.js'
import { type MockFirestore } from '../../tests/mocks/firestore.js'
import { cleanupMocks, setupMockFirebase } from '../../tests/setup.js'
import { getServiceFactory } from '../factory/getServiceFactory.js'

describe('DatabaseUserService', () => {
  let mockFirestore: MockFirestore
  let userService: UserService
  let firestore: Firestore

  beforeEach(() => {
    mockFirestore = setupMockFirebase().firestore
    firestore = admin.firestore()
    userService = getServiceFactory().user()
  })

  afterEach(() => {
    cleanupMocks()
  })

  describe('enrollUser', () => {
    it('enrolls an admin', async () => {
      const userId = 'mockAdminUserId'
      const invitationCode = 'mockAdmin'
      const displayName = 'Mock Admin'

      mockFirestore.replaceAll({
        invitations: {
          invitationId: {
            code: invitationCode,
            user: {
              type: UserType.admin,
              messagesSettings: {
                dailyRemindersAreActive: true,
                textNotificationsAreActive: true,
                medicationRemindersAreActive: true,
              },
            },
            auth: {
              displayName: displayName,
            },
          },
        },
      })

      const invitation = await userService.getInvitationByCode(invitationCode)
      if (!invitation) assert.fail('Invitation not found')
      await userService.enrollUser(invitation, userId)

      const auth = await admin.auth().getUser(userId)
      expect(auth.displayName).to.equal(displayName)
      expect(auth.customClaims).to.deep.equal({
        type: UserType.admin,
        organization: null,
      })

      const userSnapshot = await firestore.collection('users').doc(userId).get()
      expect(userSnapshot.exists).to.be.true
      const userData = userSnapshot.data() as User | undefined
      expect(userData).to.exist
      expect(userData?.invitationCode).to.equal(invitationCode)
      expect(userData?.dateOfEnrollment).to.equal(FieldValue.serverTimestamp())
    })

    it('enrolls a clinician', async () => {
      const userId = 'mockClinicianUserId'
      const invitationCode = 'mockClinician'
      const displayName = 'Mock Clinician'

      mockFirestore.replaceAll({
        invitations: {
          invitationId: {
            code: invitationCode,
            user: {
              type: UserType.clinician,
              messagesSettings: {
                dailyRemindersAreActive: true,
                textNotificationsAreActive: true,
                medicationRemindersAreActive: true,
              },
              organization: 'mockOrganization',
            },
            auth: {
              displayName: displayName,
            },
          },
        },
        organizations: {
          mockOrganization: {},
        },
      })

      const invitation = await userService.getInvitationByCode(invitationCode)
      if (!invitation) assert.fail('Invitation not found')
      await userService.enrollUser(invitation, userId)

      const auth = await admin.auth().getUser(userId)
      expect(auth.displayName).to.equal(displayName)
      expect(auth.customClaims).to.deep.equal({
        type: UserType.clinician,
        organization: 'mockOrganization',
      })

      const userSnapshot = await firestore.collection('users').doc(userId).get()
      expect(userSnapshot.exists).to.be.true
      const userData = userSnapshot.data() as User | undefined
      expect(userData).to.exist
      expect(userData?.invitationCode).to.equal(invitationCode)
      expect(userData?.dateOfEnrollment).to.equal(FieldValue.serverTimestamp())
    })

    it('enrolls a patient', async () => {
      const userId = 'mockPatientUserId'
      const invitationCode = 'mockPatient'
      const displayName = 'Mock Patient'

      mockFirestore.replaceAll({
        invitations: {
          invitationId: {
            code: invitationCode,
            user: {
              type: UserType.patient,
              clinician: 'mockClinician',
              dateOfBirth: new Date(),
              messagesSettings: {
                dailyRemindersAreActive: true,
                textNotificationsAreActive: true,
                medicationRemindersAreActive: true,
              },
              organization: 'mockOrganization',
            },
            auth: {
              displayName: displayName,
            },
          },
        },
        organizations: {
          mockOrganization: {},
        },
      })

      const invitation = await userService.getInvitationByCode(invitationCode)
      if (!invitation) assert.fail('Invitation not found')
      await userService.enrollUser(invitation, userId)

      const auth = await admin.auth().getUser(userId)
      expect(auth.displayName).to.equal(displayName)
      expect(auth.customClaims).to.deep.equal({
        type: UserType.patient,
        organization: 'mockOrganization',
      })

      const userSnapshot = await firestore.collection('users').doc(userId).get()
      expect(userSnapshot.exists).to.be.true
      const userData = userSnapshot.data() as User | undefined
      expect(userData).to.exist
      expect(userData?.invitationCode).to.equal(invitationCode)
      expect(userData?.dateOfEnrollment).to.equal(FieldValue.serverTimestamp())
    })
  })
})
