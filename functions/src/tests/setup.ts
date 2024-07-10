//
// This source file is part of the ENGAGE-HF based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import admin from 'firebase-admin'
import { stub } from 'sinon'
import { MockFirestore } from './mocks/mockFirestore.js'

export function setupMockFirestore() {
  const firestore = new MockFirestore()
  stub(admin, 'firestore').get(() => () => firestore)
}
