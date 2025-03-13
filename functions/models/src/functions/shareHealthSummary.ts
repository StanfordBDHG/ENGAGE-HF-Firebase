//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { optionalish } from '../helpers/optionalish.js'

export const shareHealthSummaryInputSchema = z.object({
  userId: optionalish(z.string()),
})

export type ShareHealthSummaryInput = z.input<
  typeof shareHealthSummaryInputSchema
>
export interface ShareHealthSummaryOutput {
  code: string
  expiresAt: string
  url: string
}
