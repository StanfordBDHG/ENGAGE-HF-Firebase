//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'

export const startPhoneNumberVerificationInputSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
})
export type StartPhoneNumberVerificationInput = z.input<
  typeof startPhoneNumberVerificationInputSchema
>
export type StartPhoneNumberVerificationOutput = undefined

export const checkPhoneNumberVerificationInputSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  code: z.string().regex(/^\d{6}$/),
})
export type CheckPhoneNumberVerificationInput = z.input<
  typeof checkPhoneNumberVerificationInputSchema
>
export type CheckPhoneNumberVerificationOutput = undefined

export const deletePhoneNumberInputSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
})
export type DeletePhoneNumberInput = z.input<
  typeof deletePhoneNumberInputSchema
>
export type DeletePhoneNumberOutput = undefined
