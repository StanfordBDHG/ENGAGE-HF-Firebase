//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type Transaction,
  type BulkWriter,
  type BulkWriterOptions,
} from 'firebase-admin/firestore'
import { type CollectionsService } from './collections.js'

export interface ReplaceDiff<T> {
  predecessor?: Document<T>
  successor?: T
}

export interface Document<Content> {
  id: string
  path: string
  lastUpdate: Date
  content: Content
}

export interface DatabaseService {
  getQuery<T>(
    query: (
      collectionsService: CollectionsService,
    ) => FirebaseFirestore.Query<T>,
  ): Promise<Document<T>[]>

  getDocument<T>(
    reference: (
      collectionsService: CollectionsService,
    ) => FirebaseFirestore.DocumentReference<T>,
  ): Promise<Document<T> | undefined>

  bulkWrite(
    write: (
      collectionsService: CollectionsService,
      writer: BulkWriter,
    ) => Promise<void>,
    options?: BulkWriterOptions,
  ): Promise<void>

  replaceCollection<T>(
    collection: (
      collectionsService: CollectionsService,
    ) => FirebaseFirestore.CollectionReference<T>,
    diffs: (existing: Document<T>[]) => Promise<ReplaceDiff<T>[]>,
  ): Promise<void>

  listCollections<T>(
    collection: (
      collections: CollectionsService,
    ) => FirebaseFirestore.DocumentReference<T>,
  ): Promise<FirebaseFirestore.CollectionReference[]>

  runTransaction<T>(
    run: (
      collectionsService: CollectionsService,
      transaction: Transaction,
    ) => Promise<T> | T,
  ): Promise<T>
}
