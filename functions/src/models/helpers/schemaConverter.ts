//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type DocumentSnapshot,
  type DocumentData,
  type FirestoreDataConverter,
} from 'firebase-admin/firestore'
import { type z } from 'zod'

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export class SchemaConverter<Schema extends z.ZodType<any, any, any>>
  implements FirestoreDataConverter<z.output<Schema>>
{
  // Properties

  readonly schema: Schema
  readonly encode: (value: z.output<Schema>) => z.input<Schema>

  get value(): this {
    return this
  }

  // Constructor

  constructor(input: {
    schema: Schema
    encode: (value: z.output<Schema>) => z.input<Schema>
  }) {
    this.schema = input.schema
    this.encode = input.encode
  }

  // Methods - FirestoreDataConverter

  fromFirestore(snapshot: DocumentSnapshot): z.output<Schema> {
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
    return this.schema.parse(snapshot.data()) as z.output<Schema>
  }

  toFirestore(modelObject: z.output<Schema>): DocumentData {
    try {
      return this.encode(modelObject) as DocumentData
    } catch (error) {
      console.error(
        `Failing to encode object of type ${typeof modelObject} due to ${String(error)}`,
      )
      throw error
    }
  }
}
