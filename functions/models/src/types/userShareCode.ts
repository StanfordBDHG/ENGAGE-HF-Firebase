//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod/v4'
import { dateTimeConverter } from '../helpers/dateConverter.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'

export const userShareCodeConverter = new SchemaConverter({
  schema: z.object({
    code: z.string(),
    tries: z.number(),
    expiresAt: dateTimeConverter.schema,
  }),
  encode: (object) => ({
    code: object.code,
    tries: object.tries,
    expiresAt: dateTimeConverter.encode(object.expiresAt),
  }),
})

export type UserShareCode = z.output<typeof userShareCodeConverter.schema>
