//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type SchemaConverter } from '@stanfordbdhg/engagehf-models'
import {
  type DocumentData,
  type DocumentSnapshot,
  type FirestoreDataConverter,
} from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'
import { type z } from 'zod'

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DatabaseConverter<Schema extends z.ZodType<any, any, any>>
  implements FirestoreDataConverter<z.output<Schema>>
{
  // Properties

  private readonly converter: SchemaConverter<Schema>

  // Constructor

  constructor(converter: SchemaConverter<Schema>) {
    this.converter = converter
  }

  // Methods

  fromFirestore(snapshot: DocumentSnapshot): z.output<Schema> {
    const data = snapshot.data()
    try {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
      return this.converter.schema.parse(data) as z.output<Schema>
    } catch (error) {
      logger.error(
        `DatabaseDecoder(${this.converter.schema._output}): Failed to decode object ${String(data)} due to ${String(error)}.`,
      )
      throw error
    }
  }

  toFirestore(modelObject: z.output<Schema>): DocumentData {
    try {
      return this.converter.encode(modelObject) as DocumentData
    } catch (error) {
      logger.error(
        `DatabaseDecoder(${typeof modelObject}): Failed to encode object ${modelObject} due to ${String(error)}.`,
      )
      throw error
    }
  }
}
