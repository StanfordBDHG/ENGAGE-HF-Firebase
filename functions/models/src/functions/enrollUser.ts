//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'

export const enrollUserInputSchema = z.object({
  invitationCode: z.string().regex(/^[A-Z0-9]{8,16}$/),
})
export type EnrollUserInputSchema = z.input<typeof enrollUserInputSchema>

export type EnrollUserOutputSchema = undefined
