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
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
    return this.converter.schema.parse(snapshot.data()) as z.output<Schema>
  }

  toFirestore(modelObject: z.output<Schema>): DocumentData {
    try {
      return this.converter.encode(modelObject) as DocumentData
    } catch (error) {
      console.error(
        `Failing to encode object of type ${typeof modelObject} due to ${String(error)}`,
      )
      throw error
    }
  }
}
