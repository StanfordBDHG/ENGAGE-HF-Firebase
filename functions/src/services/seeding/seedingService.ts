//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import fs from 'fs'
import { type CollectionReference } from 'firebase-admin/firestore'
import { z } from 'zod'

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
        console.error('Could not retrieve cached data:', error)
        if (strategy === CachingStrategy.expectCache) throw error
      }
    }

    console.log('will create data', strategy)
    const result = await create()
    console.log('did create data', strategy)
    if (
      strategy === CachingStrategy.updateCache ||
      strategy === CachingStrategy.updateCacheIfNeeded
    ) {
      await save(result)
    }
    return result
  }

  protected setCollection<T>(
    collection: CollectionReference<T>,
    data: T[] | Record<string, T>,
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

  protected async deleteCollection<T>(
    reference: CollectionReference<T>,
    transaction: FirebaseFirestore.Transaction,
  ) {
    const result = await transaction.get(reference)
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

  protected readJSONArray<Schema extends z.ZodType<any, any, any>>(
    filename: string,
    schema: Schema,
  ): Array<z.output<Schema>> {
    return schema
      .array()
      .parse(
        JSON.parse(fs.readFileSync(this.path + filename, 'utf8')),
      ) as z.output<Schema>[]
  }

  protected readJSONRecord<Schema extends z.ZodType<any, any, any>>(
    filename: string,
    schema: Schema,
  ): Record<string, z.output<Schema>> {
    return z
      .record(z.string(), schema)
      .parse(
        JSON.parse(fs.readFileSync(this.path + filename, 'utf8')),
      ) as Record<string, z.output<Schema>>
  }

  protected writeJSON(filename: string, data: unknown) {
    fs.writeFileSync(
      this.path + filename,
      JSON.stringify(data, undefined, '  '),
    )
  }
}
