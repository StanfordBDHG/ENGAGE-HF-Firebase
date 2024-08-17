//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type DocumentSnapshot } from 'firebase-admin/firestore'
import { type Change } from 'firebase-functions'
import { z } from 'zod'
import { dateConverter } from '../../models/helpers/dateConverter.js'
import { SchemaConverter } from '../../models/helpers/schemaConverter.js'

export const historyChangeItemConverter = new SchemaConverter({
  schema: z.object({
    path: z.string(),
    date: dateConverter.schema,
    data: z.unknown(),
  }),
  encode: (object) => ({
    path: object.path,
    date: dateConverter.encode(object.date),
    data: object.data,
  }),
})

export type HistoryChangeItem = z.output<
  typeof historyChangeItemConverter.schema
>

export interface HistoryService {
  recordChange(input: {
    path: string
    change: Change<DocumentSnapshot>
  }): Promise<void>
}
