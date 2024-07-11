import { assert, expect } from 'chai'
import admin from 'firebase-admin'
import { https } from 'firebase-functions/v2'
import { type UserMessage, UserMessageType } from '../models/message.js'
import { FirestoreService } from '../services/database/firestoreService.js'
import { setupMockAuth, setupMockFirestore } from '../tests/setup.js'

describe('message', () => {
  setupMockAuth()
  setupMockFirestore()
  const firestore = admin.firestore()
  const service = new FirestoreService()

  it('should update the completionDate of messages', async () => {
    const message: UserMessage = {
      dueDate: new Date('2024-01-01'),
      type: UserMessageType.medicationChange,
      title: 'Medication Change',
      description: 'You have a new medication!',
      action: 'medications',
      isDismissable: true,
    }
    await firestore.doc('users/mockUser/messages/0').set(message)
    await service.didDismissMessage('mockUser', '0', true)
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
      isDismissable: false,
    }
    await firestore.doc('users/mockUser/messages/0').set(message)
    try {
      await service.didDismissMessage('mockUser', '0', true)
      assert.fail('Message should not be dismissable.')
    } catch (error) {
      expect(error).to.deep.equal(
        new https.HttpsError('invalid-argument', 'Message is not dismissable.'),
      )
    }
  })
})