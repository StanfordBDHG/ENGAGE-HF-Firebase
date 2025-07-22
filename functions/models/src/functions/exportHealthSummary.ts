//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod/v4'
import { QuantityUnit } from '../codes/quantityUnit.js'
import { optionalish, optionalishDefault } from '../helpers/optionalish.js'

export const exportHealthSummaryInputSchema = z.object({
  userId: z.string(),
  languages: optionalish(z.array(z.string())),
  weightUnit: optionalishDefault(
    z.string().transform((value, context) => {
      const availableWeightUnits = [QuantityUnit.lbs, QuantityUnit.kg]
      const unit = availableWeightUnits.find((u) => u.code === value)
      if (unit === undefined) {
        const availableUnitsString = availableWeightUnits
          .map((u) => `'${u.code}'`)
          .join(', ')
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid weight unit. Must be one of the following: ${availableUnitsString}.`,
        })
        return z.NEVER
      }
      return unit
    }),
    QuantityUnit.lbs,
  ),
  shareCode: optionalish(z.string()),
  shareCodeId: optionalish(z.string()),
})

export type ExportHealthSummaryInput = z.input<
  typeof exportHealthSummaryInputSchema
>
export interface ExportHealthSummaryOutput {
  content: string
}
