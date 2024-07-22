//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import {
  type Transaction,
  type Firestore,
  type BulkWriter,
  type BulkWriterOptions,
} from 'firebase-admin/firestore'

export interface DatabaseDocument<Content> {
  id: string
  content: Content
}

export interface DatabaseService {
  getQuery<T>(
    query: (firestore: Firestore) => FirebaseFirestore.Query,
  ): Promise<Array<DatabaseDocument<T>>>

  getCollection<T>(path: string): Promise<Array<DatabaseDocument<T>>>

  getDocument<T>(path: string): Promise<DatabaseDocument<T> | undefined>

  bulkWrite(
    write: (firestore: Firestore, writer: BulkWriter) => Promise<void>,
    options?: BulkWriterOptions,
  ): Promise<void>

  runTransaction(
    run: (
      firestore: Firestore,
      transaction: Transaction,
    ) => Promise<void> | void,
  ): Promise<void>
}
