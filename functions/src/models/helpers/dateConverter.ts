//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { SchemaConverter } from './schemaConverter.js'

export const dateConverter = new SchemaConverter({
  schema: z
    .string()
    .datetime()
    .transform((string) => new Date(string))
    .refine((date) => !isNaN(date.getTime()), {
      message: 'Invalid date',
    }),
  encode: (object) => object.toISOString(),
})
