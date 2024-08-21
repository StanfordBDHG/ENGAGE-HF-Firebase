//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { optionalish, optionalishDefault } from '../helpers/optionalish.js'
import { userAuthConverter } from '../types/userAuth.js'
import { userConverter } from '../types/user.js'

export const getUsersInformationInputSchema = z.object({
  includeUserData: optionalishDefault(z.boolean(), false),
  userIds: z.string().array().max(100),
})
export type GetUsersInformationInput = z.input<
  typeof getUsersInformationInputSchema
>

export const userInformationSchema = z.object({
  auth: z.lazy(() => userAuthConverter.value.schema),
  user: optionalish(z.lazy(() => userConverter.value.schema)),
})
export type UserInformation = z.output<typeof userInformationSchema>

export const getUsersInformationOutputSchema = z.record(
  z.string(),
  z
    .object({
      data: userInformationSchema,
    })
    .or(
      z.object({
        error: z.object({
          code: z.string(),
          message: z.string(),
        }),
      }),
    ),
)
export type GetUsersInformationOutput = z.output<
  typeof getUsersInformationOutputSchema
>
