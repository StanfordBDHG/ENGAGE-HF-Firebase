//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type BulkWriterOptions,
  type Firestore,
} from 'firebase-admin/firestore'
import { type Document, type DatabaseService } from './databaseService.js'

export class CacheDatabaseService implements DatabaseService {
  // Properties

  // The cacheMap is actually used with multiple types of promise results
  // since the implementation would get more complex if we were to use a separate property
  // for each cache key. The cache key is used to identify the promise result.
  //
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cacheMap = new Map<string, Promise<any>>()
  private databaseService: DatabaseService

  // Constructor

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService
  }

  // Methods

  async getQuery<T>(
    query: (firestore: Firestore) => FirebaseFirestore.Query,
  ): Promise<Array<Document<T>>> {
    return this.databaseService.getQuery(query)
  }

  async getCollection<T>(path: string): Promise<Array<Document<T>>> {
    return this.accessCache(path, () =>
      this.databaseService.getCollection(path),
    )
  }

  async getDocument<T>(path: string): Promise<Document<T> | undefined> {
    return this.accessCache(path, () => this.databaseService.getDocument(path))
  }

  bulkWrite(
    write: (
      firestore: Firestore,
      writer: FirebaseFirestore.BulkWriter,
    ) => Promise<void>,
    options?: BulkWriterOptions,
  ): Promise<void> {
    return this.databaseService.bulkWrite(write, options)
  }

  async runTransaction(
    run: (
      firestore: Firestore,
      transaction: FirebaseFirestore.Transaction,
    ) => Promise<void> | void,
  ): Promise<void> {
    return this.databaseService.runTransaction(run)
  }

  // Helpers

  private async accessCache<T>(
    path: string,
    fetch: () => Promise<T>,
  ): Promise<T> {
    let promise = this.cacheMap.get(path)?.then((object) => object as T)
    if (promise) return promise
    promise = fetch()
    this.cacheMap.set(path, promise)
    return promise
  }
}
