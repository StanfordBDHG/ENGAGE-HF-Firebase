//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { dateConverter } from '../helpers/dateConverter.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'

export const userShareCodeConverter = new SchemaConverter({
  schema: z.object({
    code: z.string(),
    tries: z.number(),
    expiresAt: dateConverter.schema,
  }),
  encode: (object) => ({
    code: object.code,
    tries: object.tries,
    expiresAt: dateConverter.encode(object.expiresAt),
  }),
})

export type UserShareCode = z.output<typeof userShareCodeConverter.schema>
