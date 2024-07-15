//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import admin from 'firebase-admin'
import { stub, restore } from 'sinon'
import { MockAuth } from './mocks/auth.js'
import { MockFirestore } from './mocks/firestore.js'

export function setupMockAuth() {
  const auth = new MockAuth()
  stub(admin, 'auth').get(() => () => auth)
}

export function setupMockFirestore(): MockFirestore {
  const firestore = new MockFirestore()
  stub(admin, 'firestore').get(() => () => firestore)
  return firestore
}

export function cleanupMocks() {
  restore()
}
