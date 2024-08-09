//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import admin from 'firebase-admin'
import { type Firestore } from 'firebase-admin/firestore'
import { https } from 'firebase-functions'
import { type MessageService } from './messageService.js'
import { type UserMessage, UserMessageType } from '../../models/message.js'
import { cleanupMocks, setupMockFirebase } from '../../tests/setup.js'
import { getServiceFactory } from '../factory/getServiceFactory.js'

describe('DefaultMessageService', () => {
  let messageService: MessageService
  let firestore: Firestore

  beforeEach(() => {
    setupMockFirebase()
    firestore = admin.firestore()
    messageService = getServiceFactory().message()
  })

  afterEach(() => {
    cleanupMocks()
  })

  describe('dismissMessage', () => {
    it('should update the completionDate of messages', async () => {
      const message: UserMessage = {
        creationDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-01'),
        completionDate: null,
        type: UserMessageType.medicationChange,
        title: 'Medication Change',
        description: 'You have a new medication!',
        action: 'medications',
        isDismissible: true,
      }
      await firestore.doc('users/mockUser/messages/0').set(message)
      await messageService.dismissMessage('mockUser', '0', true)
      const updatedMessage = await firestore
        .doc('users/mockUser/messages/0')
        .get()
      expect(updatedMessage.data()?.completionDate).to.not.be.undefined
    })

    it('should not update the completionDate of messages', async () => {
      const message: UserMessage = {
        creationDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-01'),
        completionDate: null,
        type: UserMessageType.preAppointment,
        title: 'Upcoming appointment',
        description: 'You have an upcoming appointment!',
        action: 'healthSummary',
        isDismissible: false,
      }
      await firestore.doc('users/mockUser/messages/0').set(message)
      try {
        await messageService.dismissMessage('mockUser', '0', true)
        expect.fail('Message should not be dismissible.')
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
