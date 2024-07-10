import admin from 'firebase-admin'

export function setupTests() {
  admin.initializeApp()
}
