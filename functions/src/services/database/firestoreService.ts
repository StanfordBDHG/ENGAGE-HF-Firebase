//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import admin from 'firebase-admin'
import { type Firestore } from 'firebase-admin/firestore'
import {
  type DatabaseDocument,
  type DatabaseService,
} from './databaseService.js'

export class FirestoreService implements DatabaseService {
  // Properties

  private readonly firestore: Firestore

  // Constructor

  constructor(firestore: Firestore = admin.firestore()) {
    this.firestore = firestore
  }

  // Methods

  async getQuery<T>(
    query: (firestore: Firestore) => FirebaseFirestore.Query,
  ): Promise<Array<DatabaseDocument<T>>> {
    const collection = await query(this.firestore).get()
    return collection.docs.map((doc) => ({
      id: doc.id,
      content: doc.data() as T,
    }))
  }

  async getCollection<T>(path: string): Promise<Array<DatabaseDocument<T>>> {
    const collection = await this.firestore.collection(path).get()
    return collection.docs.map((doc) => ({
      id: doc.id,
      content: doc.data() as T,
    }))
  }

  async getDocument<T>(path: string): Promise<DatabaseDocument<T | undefined>> {
    const doc = await this.firestore.doc(path).get()
    return { id: doc.id, content: doc.data() as T | undefined }
  }

  async runTransaction(
    run: (
      firestore: admin.firestore.Firestore,
      transaction: admin.firestore.Transaction,
    ) => Promise<void> | void,
  ): Promise<void> {
    return this.firestore.runTransaction(async (transaction) =>
      run(this.firestore, transaction),
    )
  }
}
