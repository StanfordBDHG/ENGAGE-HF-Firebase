import admin from 'firebase-admin'
import { stub } from 'sinon'
import { MockFirestore } from './mocks/mockFirestore.js'

export function setupMockFirestore() {
  const firestore = new MockFirestore()
  stub(admin, 'firestore').get(() => () => firestore)
}
