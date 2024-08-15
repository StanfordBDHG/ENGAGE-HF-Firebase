//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { userAuthConverter, type UserAuth } from './userAuth.js'
import {
  userRegistrationConverter,
  type UserRegistration,
} from './userRegistration.js'
import { Lazy } from '../../services/factory/lazy.js'
import { optionalish } from '../helpers/optionalish.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'

export const invitationConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: z
        .object({
          userId: optionalish(z.string()),
          code: z.string(),
          auth: optionalish(z.lazy(() => userAuthConverter.value.schema)),
          user: z.lazy(() => userRegistrationConverter.value.schema),
        })
        .transform((values) => new Invitation(values)),
      encode: (object) => ({
        userId: object.userId,
        code: object.code,
        auth: object.auth ? userAuthConverter.value.encode(object.auth) : null,
        user: userRegistrationConverter.value.encode(object.user),
      }),
    }),
)

export class Invitation {
  // Properties

  readonly userId?: string
  readonly code: string
  readonly auth?: UserAuth
  readonly user: UserRegistration

  // Constructor

  constructor(input: {
    userId?: string
    code: string
    auth?: UserAuth
    user: UserRegistration
  }) {
    this.userId = input.userId
    this.code = input.code
    this.auth = input.auth
    this.user = input.user
  }
}
