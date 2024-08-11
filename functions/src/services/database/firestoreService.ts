//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type BulkWriter,
  type BulkWriterOptions,
  type Transaction,
  type Firestore,
} from 'firebase-admin/firestore'
import { type Document, type DatabaseService } from './databaseService.js'

export class FirestoreService implements DatabaseService {
  // Properties

  private readonly firestore: Firestore

  // Constructor

  constructor(firestore: Firestore) {
    this.firestore = firestore
  }

  // Methods

  async getQuery<T>(
    query: (firestore: Firestore) => FirebaseFirestore.Query,
  ): Promise<Array<Document<T>>> {
    const collection = await query(this.firestore).get()
    return collection.docs.map((doc) => ({
      id: doc.id,
      path: doc.ref.path,
      content: doc.data() as T,
    }))
  }

  async getCollection<T>(path: string): Promise<Array<Document<T>>> {
    const collection = await this.firestore.collection(path).get()
    return collection.docs.map((doc) => ({
      id: doc.id,
      path: doc.ref.path,
      content: doc.data() as T,
    }))
  }

  async getDocument<T>(path: string): Promise<Document<T> | undefined> {
    const doc = await this.firestore.doc(path).get()
    return doc.exists ?
        { id: doc.id, path: doc.ref.path, content: doc.data() as T }
      : undefined
  }

  async bulkWrite(
    write: (firestore: Firestore, writer: BulkWriter) => Promise<void>,
    options?: BulkWriterOptions,
  ): Promise<void> {
    const writer = this.firestore.bulkWriter(options)
    await write(this.firestore, writer)
    await writer.close()
  }

  async runTransaction<T>(
    run: (firestore: Firestore, transaction: Transaction) => Promise<T> | T,
  ): Promise<T> {
    return this.firestore.runTransaction(async (transaction) =>
      run(this.firestore, transaction),
    )
  }
}
