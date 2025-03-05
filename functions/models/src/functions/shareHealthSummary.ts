//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { optionalish } from '../helpers/optionalish.js'
import { type userShareCodeConverter } from '../types/userShareCode.js'

export const shareHealthSummaryInputSchema = z.object({
  userId: optionalish(z.string()),
})

export type ShareHealthSummaryInput = z.input<
  typeof shareHealthSummaryInputSchema
>
export type ShareHealthSummaryOutput = z.output<
  typeof userShareCodeConverter.schema
>
