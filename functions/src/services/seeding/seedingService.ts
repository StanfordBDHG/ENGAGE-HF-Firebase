//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import fs from 'fs'
import { type Firestore } from 'firebase-admin/firestore'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

export enum CachingStrategy {
  expectCache = 'expectCache',
  ignoreCache = 'ignoreCache',
  updateCache = 'updateCache',
  updateCacheIfNeeded = 'updateCacheIfNeeded',
}

export interface SeedingOptions {
  useIndicesAsKeys: boolean
  path: string
}

export class SeedingService {
  private useIndicesAsKeys: boolean
  private path: string

  constructor(options: SeedingOptions) {
    this.useIndicesAsKeys = options.useIndicesAsKeys
    this.path = options.path
  }

  protected async cache<T>(
    strategy: CachingStrategy,
    retrieve: () => Promise<T> | T,
    create: () => Promise<T> | T,
    save: (value: T) => Promise<void> | void,
  ): Promise<T> {
    if (
      strategy === CachingStrategy.expectCache ||
      strategy === CachingStrategy.updateCacheIfNeeded
    ) {
      try {
        return await retrieve()
      } catch (error) {
        if (strategy === CachingStrategy.expectCache) throw error
      }
    }

    const result = await create()
    if (
      strategy === CachingStrategy.updateCache ||
      strategy === CachingStrategy.updateCacheIfNeeded
    ) {
      await save(result)
    }
    return result
  }

  protected setUnstructuredCollection(
    collection: any,
    data: any,
    transaction: FirebaseFirestore.Transaction,
  ) {
    if (Array.isArray(data)) {
      for (let index = 0; index < data.length; index++) {
        const document =
          this.useIndicesAsKeys ?
            collection.doc(String(index))
          : collection.doc()
        transaction.set(document, data[index])
      }
    } else {
      for (const key of Object.keys(data)) {
        transaction.set(collection.doc(key), data[key])
      }
    }
  }

  protected setStructuredCollection(
    collection: any,
    data: any,
    transaction: FirebaseFirestore.Transaction,
  ) {
    if (Array.isArray(data)) {
      for (let index = 0; index < data.length; index++) {
        const document =
          this.useIndicesAsKeys ?
            collection.doc(String(index))
          : collection.doc()
        this.setStructuredDocument(document, data[index], transaction)
      }
    } else {
      for (const key of Object.keys(data)) {
        this.setStructuredDocument(collection.doc(key), data[key], transaction)
      }
    }
  }

  protected setStructuredDocument(
    document: any,
    data: any,
    transaction: FirebaseFirestore.Transaction,
  ) {
    if (typeof data !== 'object') {
      transaction.set(document, data)
    } else {
      const dataWithoutSubcollections: Record<string, any> = {}
      for (const key of Object.keys(data)) {
        const value = data[key]
        if (Array.isArray(value)) {
          this.setStructuredCollection(
            document.collection(key),
            value,
            transaction,
          )
        } else {
          dataWithoutSubcollections[key] = value
        }
      }
      transaction.set(document, dataWithoutSubcollections)
    }
  }

  protected async deleteCollection(
    name: string,
    firestore: Firestore,
    transaction: FirebaseFirestore.Transaction,
  ) {
    const result = await transaction.get(firestore.collection(name))
    for (const doc of result.docs) {
      transaction.delete(doc.ref)
    }
  }

  protected filesExist(...filenames: string[]) {
    return filenames.reduce(
      (acc, filename) => acc && fs.existsSync(this.path + filename),
      true,
    )
  }

  protected readJSON<T = any>(filename: string): T {
    return JSON.parse(fs.readFileSync(this.path + filename, 'utf8')) as T
  }

  protected writeJSON(filename: string, data: unknown) {
    fs.writeFileSync(
      this.path + filename,
      JSON.stringify(data, undefined, '  '),
    )
  }
}
