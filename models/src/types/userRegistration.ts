//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import {
  userMessagesSettingsConverter,
  type UserMessagesSettings,
} from './userMessagesSettings.js'
import { UserType } from './userType.js'
import { dateConverter } from '../helpers/dateConverter.js'
import { Lazy } from '../helpers/lazy.js'
import { optionalish } from '../helpers/optionalish.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'

export const userRegistrationInputConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: z.object({
        type: z.nativeEnum(UserType),
        organization: optionalish(z.string()),
        dateOfBirth: optionalish(dateConverter.schema),
        clinician: optionalish(z.string()),
        messagesSettings: optionalish(
          z.lazy(() => userMessagesSettingsConverter.value.schema),
        ),
        language: optionalish(z.string()),
        timeZone: optionalish(z.string()),
      }),
      encode: (object) => ({
        type: object.type,
        organization: object.organization ?? null,
        dateOfBirth:
          object.dateOfBirth ? dateConverter.encode(object.dateOfBirth) : null,
        clinician: object.clinician ?? null,
        messagesSettings:
          object.messagesSettings ?
            userMessagesSettingsConverter.value.encode(object.messagesSettings)
          : null,
        language: object.language ?? null,
        timeZone: object.timeZone ?? null,
      }),
    }),
)

export const userRegistrationConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: userRegistrationInputConverter.value.schema.transform(
        (values) => new UserRegistration(values),
      ),
      encode: (object) => userRegistrationInputConverter.value.encode(object),
    }),
)

export class UserRegistration {
  // Properties

  readonly type: UserType
  readonly organization?: string

  readonly dateOfBirth?: Date
  readonly clinician?: string

  readonly messagesSettings?: UserMessagesSettings

  readonly language?: string
  readonly timeZone?: string

  // Constructor

  constructor(input: {
    type: UserType
    organization?: string
    dateOfBirth?: Date
    clinician?: string
    messagesSettings?: UserMessagesSettings
    language?: string
    timeZone?: string
  }) {
    this.type = input.type
    this.organization = input.organization
    this.dateOfBirth = input.dateOfBirth
    this.clinician = input.clinician
    this.messagesSettings = input.messagesSettings
    this.language = input.language
    this.timeZone = input.timeZone
  }
}
