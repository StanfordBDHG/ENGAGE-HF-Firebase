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
import { https } from 'firebase-functions'
import { describe } from 'mocha'
import { DatabaseUserService } from './databaseUserService.js'
import { type UserService } from './userService.js'
import { type Invitation } from '../../models/invitation.js'
import { type UserMessage, UserMessageType } from '../../models/message.js'
import { type Admin, type Patient, type User } from '../../models/user.js'
import { type MockFirestore } from '../../tests/mocks/firestore.js'
import {
  cleanupMocks,
  setupMockAuth,
  setupMockFirestore,
} from '../../tests/setup.js'
import { CacheDatabaseService } from '../database/cacheDatabaseService.js'
import { FirestoreService } from '../database/firestoreService.js'

describe('UserService', () => {
  let mockFirestore: MockFirestore
  let userService: UserService
  let firestore: Firestore

  beforeEach(() => {
    setupMockAuth()
    mockFirestore = setupMockFirestore()
    firestore = admin.firestore()
    userService = new DatabaseUserService(
      new CacheDatabaseService(new FirestoreService()),
    )
  })

  afterEach(() => {
    cleanupMocks()
  })

  describe('enrollUser', () => {
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

      const invitation = await userService.getInvitation(invitationId)
      if (!invitation) assert.fail('Invitation not found')
      await userService.enrollUser(invitation, userId)

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

      const invitation = await userService.getInvitation(invitationId)
      if (!invitation) assert.fail('Invitation not found')
      await userService.enrollUser(invitation, userId)

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

      const invitation = await userService.getInvitation(invitationId)
      if (!invitation) assert.fail('Invitation not found')
      await userService.enrollUser(invitation, userId)

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

      const invitation = await userService.getInvitation(invitationId)
      if (!invitation) assert.fail('Invitation not found')
      await userService.enrollUser(invitation, userId)

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

  describe('dismissMessage', () => {
    it('should update the completionDate of messages', async () => {
      const message: UserMessage = {
        dueDate: new Date('2024-01-01'),
        type: UserMessageType.medicationChange,
        title: 'Medication Change',
        description: 'You have a new medication!',
        action: 'medications',
        isDismissible: true,
      }
      await firestore.doc('users/mockUser/messages/0').set(message)
      await userService.dismissMessage('mockUser', '0', true)
      const updatedMessage = await firestore
        .doc('users/mockUser/messages/0')
        .get()
      expect(updatedMessage.data()?.completionDate).to.not.be.undefined
    })

    it('should not update the completionDate of messages', async () => {
      const message: UserMessage = {
        dueDate: new Date('2024-01-01'),
        type: UserMessageType.preAppointment,
        title: 'Upcoming appointment',
        description: 'You have an upcoming appointment!',
        action: 'healthSummary',
        isDismissible: false,
      }
      await firestore.doc('users/mockUser/messages/0').set(message)
      try {
        await userService.dismissMessage('mockUser', '0', true)
        assert.fail('Message should not be dismissible.')
      } catch (error) {
        expect(error).to.deep.equal(
          new https.HttpsError(
            'invalid-argument',
            'Message is not dismissible.',
          ),
        )
      }
    })
  })
})
