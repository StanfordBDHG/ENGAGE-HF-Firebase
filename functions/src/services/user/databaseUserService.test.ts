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
import { type UserService } from './userService.js'
import { type Invitation } from '../../models/invitation.js'
import { type UserMessage, UserMessageType } from '../../models/message.js'
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
      const invitationId = 'mockAdmin'
      const displayName = 'Mock Admin'

      mockFirestore.replaceAll({
        invitations: {
          mockAdmin: {
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

      const invitation = await userService.getInvitation(invitationId)
      if (!invitation) assert.fail('Invitation not found')
      await userService.enrollUser(invitation, userId)

      const auth = await admin.auth().getUser(userId)
      expect(auth.displayName).to.equal(displayName)
      expect(auth.customClaims).to.deep.equal({
        type: UserType.admin,
        organization: null,
      })

      const invitationSnapshot = await firestore
        .collection('invitations')
        .doc(invitationId)
        .get()
      expect(invitationSnapshot.exists).to.be.false
      const invitationData = invitationSnapshot.data() as Invitation | undefined
      expect(invitationData).to.be.undefined

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

      mockFirestore.replaceAll({
        invitations: {
          mockClinician: {
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

      const invitation = await userService.getInvitation(invitationId)
      if (!invitation) assert.fail('Invitation not found')
      await userService.enrollUser(invitation, userId)

      const auth = await admin.auth().getUser(userId)
      expect(auth.displayName).to.equal(displayName)
      expect(auth.customClaims).to.deep.equal({
        type: UserType.clinician,
        organization: 'mockOrganization',
      })

      const invitationSnapshot = await firestore
        .collection('invitations')
        .doc(invitationId)
        .get()
      expect(invitationSnapshot.exists).to.be.false
      const invitationData = invitationSnapshot.data() as Invitation | undefined
      expect(invitationData).to.be.undefined

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

      mockFirestore.replaceAll({
        invitations: {
          mockPatient: {
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

      const invitation = await userService.getInvitation(invitationId)
      if (!invitation) assert.fail('Invitation not found')
      await userService.enrollUser(invitation, userId)

      const auth = await admin.auth().getUser(userId)
      expect(auth.displayName).to.equal(displayName)
      expect(auth.customClaims).to.deep.equal({
        type: UserType.patient,
        organization: 'mockOrganization',
      })

      const invitationSnapshot = await firestore
        .collection('invitations')
        .doc(invitationId)
        .get()
      expect(invitationSnapshot.exists).to.be.false
      const invitationData = invitationSnapshot.data() as Invitation | undefined
      expect(invitationData).to.be.undefined

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
        dueDate: new Date('2024-01-01').toISOString(),
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
        dueDate: new Date('2024-01-01').toISOString(),
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
