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
  schema: z.string().transform((string, context) => {
    try {
      const date = new Date(string)
      if (isNaN(date.getTime())) {
        context.addIssue({
          code: 'custom',
          message: 'Invalid date',
        })
        return z.NEVER
      }
      return date
    } catch (error) {
      context.addIssue({
        code: 'custom',
        message: String(error),
      })
      return z.NEVER
    }
  }),
  encode: (object) => {
    const offset = object.getTimezoneOffset()
    const localDate = new Date(object.getTime() - offset * 60 * 1000)
    return localDate.toISOString().split('T')[0]
  },
})

export const dateTimeConverter = new SchemaConverter({
  schema: z.string().transform((string, context) => {
    try {
      const date = new Date(string)
      if (isNaN(date.getTime())) {
        context.addIssue({
          code: 'custom',
          message: 'Invalid date',
        })
        return z.NEVER
      }
      return date
    } catch (error) {
      context.addIssue({
        code: 'custom',
        message: String(error),
      })
      return z.NEVER
    }
  }),
  encode: (object) => object.toISOString(),
})
