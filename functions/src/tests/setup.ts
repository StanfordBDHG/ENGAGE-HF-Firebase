//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import admin from 'firebase-admin'
import { stub } from 'sinon'
import { MockFirestore } from './mocks/mockFirestore.js'
import { MockAuth } from './mocks/mockAuth.js'

export function setupMockAuth() {
    const auth = new MockAuth()
    stub(admin, 'auth').get(() => () => auth)
}

export function setupMockFirestore() {
  const firestore = new MockFirestore()
  stub(admin, 'firestore').get(() => () => firestore)
}