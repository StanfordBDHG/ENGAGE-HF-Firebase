//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { Lazy } from '@stanfordbdhg/engagehf-models'
import {
  type BulkWriter,
  type BulkWriterOptions,
  type Transaction,
  type Firestore,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore'
import { CollectionsService } from './collections.js'
import {
  type Document,
  type DatabaseService,
  type ReplaceDiff,
} from './databaseService.js'

export class FirestoreService implements DatabaseService {
  // Properties

  private readonly collectionsService = new Lazy(
    () => new CollectionsService(this.firestore),
  )
  private readonly firestore: Firestore

  // Constructor

  constructor(firestore: Firestore) {
    this.firestore = firestore
  }

  // Methods

  async getQuery<T>(
    query: (
      collectionsService: CollectionsService,
    ) => FirebaseFirestore.Query<T>,
  ): Promise<Array<Document<T>>> {
    const collection = await query(this.collectionsService.value).get()
    return collection.docs.map((doc) => this.queryDoc(doc))
  }

  async getDocument<T>(
    reference: (
      collectionsService: CollectionsService,
    ) => FirebaseFirestore.DocumentReference<T>,
  ): Promise<Document<T> | undefined> {
    const ref = reference(this.collectionsService.value)
    const doc = await ref.get()
    const data = doc.exists ? doc.data() : undefined
    return doc.exists && data !== undefined ?
        {
          id: doc.id,
          path: doc.ref.path,
          // `lastUpdate` should not be undefined in this case
          lastUpdate: doc.updateTime?.toDate() ?? doc.readTime.toDate(),
          content: data,
        }
      : undefined
  }

  async bulkWrite(
    write: (
      collectionsService: CollectionsService,
      writer: BulkWriter,
    ) => Promise<void>,
    options?: BulkWriterOptions,
  ): Promise<void> {
    const writer = this.firestore.bulkWriter(options)
    await write(this.collectionsService.value, writer)
    await writer.close()
  }

  async replaceCollection<T>(
    collection: (
      collectionsService: CollectionsService,
    ) => FirebaseFirestore.CollectionReference<T>,
    diffs: (existing: Array<Document<T>>) => Promise<Array<ReplaceDiff<T>>>,
  ): Promise<void> {
    await this.runTransaction(async (collections, transaction) => {
      const collectionRef = collection(collections)
      const existingDocs = await transaction.get(collectionRef)
      const docsDiffs = await diffs(
        existingDocs.docs.map((doc) => this.queryDoc(doc)),
      )
      for (const docsDiff of docsDiffs) {
        if (docsDiff.predecessor !== undefined) {
          const ref = collectionRef.doc(docsDiff.predecessor.id)
          if (docsDiff.successor !== undefined) {
            transaction.set(ref, docsDiff.successor)
          } else {
            transaction.delete(ref)
          }
        } else if (docsDiff.successor !== undefined) {
          transaction.create(collectionRef.doc(), docsDiff.successor)
        }
      }
    })
  }

  async listCollections<T>(
    docReference: (
      collections: CollectionsService,
    ) => FirebaseFirestore.DocumentReference<T>,
  ): Promise<FirebaseFirestore.CollectionReference[]> {
    return docReference(this.collectionsService.value).listCollections()
  }

  async runTransaction<T>(
    run: (
      collectionsService: CollectionsService,
      transaction: Transaction,
    ) => Promise<T> | T,
  ): Promise<T> {
    return this.firestore.runTransaction(async (transaction) =>
      run(this.collectionsService.value, transaction),
    )
  }

  private queryDoc<T>(snapshot: QueryDocumentSnapshot<T>): Document<T> {
    return {
      id: snapshot.id,
      path: snapshot.ref.path,
      lastUpdate: snapshot.updateTime.toDate(),
      content: snapshot.data(),
    }
  }
}
