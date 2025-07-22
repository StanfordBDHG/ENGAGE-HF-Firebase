//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  dateTimeConverter,
  SchemaConverter,
} from '@stanfordbdhg/engagehf-models'
import { type DocumentSnapshot } from 'firebase-admin/firestore'
import { type Change } from 'firebase-functions'
import { z } from 'zod/v4'

export const historyChangeItemConverter = new SchemaConverter({
  schema: z.object({
    path: z.string(),
    date: dateTimeConverter.schema,
    data: z.unknown(),
  }),
  encode: (object) => ({
    path: object.path,
    date: dateTimeConverter.encode(object.date),
    data: object.data === undefined ? null : object.data,
  }),
})
export type HistoryChangeItem = z.output<
  typeof historyChangeItemConverter.schema
>

export interface HistoryService {
  isEmpty(): Promise<boolean>
  recordChange(change: Change<DocumentSnapshot>): Promise<void>
}
