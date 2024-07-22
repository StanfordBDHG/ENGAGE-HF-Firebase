//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import admin from 'firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { describe } from 'mocha'
import { type Invitation } from '../models/invitation.js'
import { type Admin, type Patient, type User } from '../models/user.js'
import { FirestoreService } from '../services/database/firestoreService.js'
import { DatabaseUserService } from '../services/user/databaseUserService.js'
import { type UserService } from '../services/user/userService.js'
import { type MockFirestore } from '../tests/mocks/firestore.js'
import {
  cleanupMocks,
  setupMockAuth,
  setupMockFirestore,
} from '../tests/setup.js'

describe('Functions: Invitation', () => {
  describe('enrollUser', () => {
    let mockFirestore: MockFirestore
    let userService: UserService

    beforeEach(() => {
      setupMockAuth()
      mockFirestore = setupMockFirestore()
      userService = new DatabaseUserService(new FirestoreService())
    })

    afterEach(() => {
      cleanupMocks()
    })

    it('enrolls an admin', async () => {
      const userId = 'mockAdminUserId'
      const invitationId = 'mockAdmin'
      const displayName = 'Mock Admin'

      mockFirestore.collections = {
        invitations: {
          mockAdmin: {
            used: false,
            user: {
              messagesSettings: {
                dailyRemindersAreActive: true,
                textNotificationsAreActive: true,
                medicationRemindersAreActive: true,
              },
            },
            auth: {
              displayName: displayName,
            },
            admin: {},
          },
        },
      }

      await userService.enrollUser(invitationId, userId)

      const firestore = admin.firestore()

      const invitationSnapshot = await firestore
        .collection('invitations')
        .doc(invitationId)
        .get()
      expect(invitationSnapshot.exists).to.be.false
      const invitationData = invitationSnapshot.data() as Invitation | undefined
      expect(invitationData).to.be.undefined

      const adminSnapshot = await firestore
        .collection('admins')
        .doc(userId)
        .get()
      expect(adminSnapshot.exists).to.be.true
      const adminData = adminSnapshot.data() as Admin | undefined
      expect(adminData).to.exist

      const clinicianSnapshot = await firestore
        .collection('clinicians')
        .doc(userId)
        .get()
      expect(clinicianSnapshot.exists).to.be.false
      const clinicianData = clinicianSnapshot.data() as Admin | undefined
      expect(clinicianData).to.be.undefined

      const patientSnapshot = await firestore
        .collection('patients')
        .doc(userId)
        .get()
      expect(patientSnapshot.exists).to.be.false
      const patientData = patientSnapshot.data() as Patient | undefined
      expect(patientData).to.be.undefined

      const userSnapshot = await firestore.collection('users').doc(userId).get()
      expect(userSnapshot.exists).to.be.true
      const userData = userSnapshot.data() as User | undefined
      expect(userData).to.exist
      expect(userData?.invitationCode).to.equal(invitationId)
      expect(userData?.dateOfEnrollment).to.equal(FieldValue.serverTimestamp())
    })

    it('enrolls a clinician', async () => {
      const userId = 'mockClinicianUserId'
      const invitationId = 'mockClinician'
      const displayName = 'Mock Clinician'

      mockFirestore.collections = {
        invitations: {
          mockClinician: {
            used: false,
            user: {
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
            clinician: {},
          },
        },
      }

      await userService.enrollUser(invitationId, userId)

      const firestore = admin.firestore()

      const invitationSnapshot = await firestore
        .collection('invitations')
        .doc(invitationId)
        .get()
      expect(invitationSnapshot.exists).to.be.false
      const invitationData = invitationSnapshot.data() as Invitation | undefined
      expect(invitationData).to.be.undefined

      const adminSnapshot = await firestore
        .collection('admins')
        .doc(userId)
        .get()
      expect(adminSnapshot.exists).to.be.false
      const adminData = adminSnapshot.data() as Admin | undefined
      expect(adminData).to.be.undefined

      const clinicianSnapshot = await firestore
        .collection('clinicians')
        .doc(userId)
        .get()
      expect(clinicianSnapshot.exists).to.be.true
      const clinicianData = clinicianSnapshot.data() as Admin | undefined
      expect(clinicianData).to.exist

      const patientSnapshot = await firestore
        .collection('patients')
        .doc(userId)
        .get()
      expect(patientSnapshot.exists).to.be.false
      const patientData = patientSnapshot.data() as Patient | undefined
      expect(patientData).to.be.undefined

      const userSnapshot = await firestore.collection('users').doc(userId).get()
      expect(userSnapshot.exists).to.be.true
      const userData = userSnapshot.data() as User | undefined
      expect(userData).to.exist
      expect(userData?.invitationCode).to.equal(invitationId)
      expect(userData?.dateOfEnrollment).to.equal(FieldValue.serverTimestamp())
    })

    it('enrolls a patient', async () => {
      const userId = 'mockPatientUserId'
      const invitationId = 'mockPatient'
      const displayName = 'Mock Patient'

      mockFirestore.collections = {
        invitations: {
          mockPatient: {
            used: false,
            user: {
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
            patient: {
              clinician: 'mockClinician',
              dateOfBirth: new Date(),
            },
          },
        },
      }

      await userService.enrollUser(invitationId, userId)

      const firestore = admin.firestore()

      const invitationSnapshot = await firestore
        .collection('invitations')
        .doc(invitationId)
        .get()
      expect(invitationSnapshot.exists).to.be.false
      const invitationData = invitationSnapshot.data() as Invitation | undefined
      expect(invitationData).to.be.undefined

      const adminSnapshot = await firestore
        .collection('admins')
        .doc(userId)
        .get()
      expect(adminSnapshot.exists).to.be.false
      const adminData = adminSnapshot.data() as Admin | undefined
      expect(adminData).to.be.undefined

      const clinicianSnapshot = await firestore
        .collection('clinicians')
        .doc(userId)
        .get()
      expect(clinicianSnapshot.exists).to.be.false
      const clinicianData = clinicianSnapshot.data() as Admin | undefined
      expect(clinicianData).to.be.undefined

      const patientSnapshot = await firestore
        .collection('patients')
        .doc(userId)
        .get()
      expect(patientSnapshot.exists).to.be.true
      const patientData = patientSnapshot.data() as Patient | undefined
      expect(patientData).to.exist
      expect(patientData?.clinician).to.equal('mockClinician')
      expect(patientData?.dateOfBirth).to.be.instanceOf(Date)

      const userSnapshot = await firestore.collection('users').doc(userId).get()
      expect(userSnapshot.exists).to.be.true
      const userData = userSnapshot.data() as User | undefined
      expect(userData).to.exist
      expect(userData?.invitationCode).to.equal(invitationId)
      expect(userData?.dateOfEnrollment).to.equal(FieldValue.serverTimestamp())
    })

    it('enrolls a user', async () => {
      const userId = 'mockUserUserId'
      const invitationId = 'mockUser'
      const displayName = 'Mock User'

      mockFirestore.collections = {
        invitations: {
          mockUser: {
            used: false,
            user: {
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
      }

      await userService.enrollUser(invitationId, userId)

      const firestore = admin.firestore()

      const invitationSnapshot = await firestore
        .collection('invitations')
        .doc(invitationId)
        .get()
      expect(invitationSnapshot.exists).to.be.false
      const invitationData = invitationSnapshot.data() as Invitation | undefined
      expect(invitationData).to.be.undefined

      const adminSnapshot = await firestore
        .collection('admins')
        .doc(userId)
        .get()
      expect(adminSnapshot.exists).to.be.false
      const adminData = adminSnapshot.data() as Admin | undefined
      expect(adminData).to.be.undefined

      const clinicianSnapshot = await firestore
        .collection('clinicians')
        .doc(userId)
        .get()
      expect(clinicianSnapshot.exists).to.be.false
      const clinicianData = clinicianSnapshot.data() as Admin | undefined
      expect(clinicianData).to.be.undefined

      const patientSnapshot = await firestore
        .collection('patients')
        .doc(userId)
        .get()
      expect(patientSnapshot.exists).to.be.false
      const patientData = patientSnapshot.data() as Patient | undefined
      expect(patientData).to.be.undefined

      const userSnapshot = await firestore.collection('users').doc(userId).get()
      expect(userSnapshot.exists).to.be.true
      const userData = userSnapshot.data() as User | undefined
      expect(userData).to.exist
      expect(userData?.invitationCode).to.equal(invitationId)
      expect(userData?.dateOfEnrollment).to.equal(FieldValue.serverTimestamp())
    })
  })
})
