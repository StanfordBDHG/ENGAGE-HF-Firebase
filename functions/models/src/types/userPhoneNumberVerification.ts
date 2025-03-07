//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { SchemaConverter } from '../helpers/schemaConverter.js'

export const userPhoneNumberVerificationConverter = new SchemaConverter({
  schema: z.object({
    phoneNumber: z.string(),
    verificationId: z.string(),
  }),
  encode: (object) => ({
    phoneNumber: object.phoneNumber,
    verificationId: object.verificationId,
  }),
})
