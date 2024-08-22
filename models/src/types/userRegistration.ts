//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
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
        receivesAppointmentReminders: optionalish(z.boolean()),
        receivesMedicationUpdates: optionalish(z.boolean()),
        receivesQuestionnaireReminders: optionalish(z.boolean()),
        receivesRecommendationUpdates: optionalish(z.boolean()),
        receivesVitalsReminders: optionalish(z.boolean()),
        receivesWeightAlerts: optionalish(z.boolean()),
        language: optionalish(z.string()),
        timeZone: optionalish(z.string()),
      }),
      encode: (object) => ({
        type: object.type,
        organization: object.organization ?? null,
        dateOfBirth:
          object.dateOfBirth ? dateConverter.encode(object.dateOfBirth) : null,
        clinician: object.clinician ?? null,
        receivesAppointmentReminders:
          object.receivesAppointmentReminders ?? null,
        receivesMedicationUpdates: object.receivesMedicationUpdates ?? null,
        receivesQuestionnaireReminders:
          object.receivesQuestionnaireReminders ?? null,
        receivesRecommendationUpdates:
          object.receivesRecommendationUpdates ?? null,
        receivesVitalsReminders: object.receivesVitalsReminders ?? null,
        receivesWeightAlerts: object.receivesWeightAlerts ?? null,
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

  readonly receivesAppointmentReminders?: boolean
  readonly receivesMedicationUpdates?: boolean
  readonly receivesQuestionnaireReminders?: boolean
  readonly receivesRecommendationUpdates?: boolean
  readonly receivesVitalsReminders?: boolean
  readonly receivesWeightAlerts?: boolean

  readonly language?: string
  readonly timeZone?: string

  // Constructor

  constructor(input: {
    type: UserType
    organization?: string
    dateOfBirth?: Date
    clinician?: string
    receivesAppointmentReminders?: boolean
    receivesMedicationUpdates?: boolean
    receivesQuestionnaireReminders?: boolean
    receivesRecommendationUpdates?: boolean
    receivesVitalsReminders?: boolean
    receivesWeightAlerts?: boolean
    language?: string
    timeZone?: string
  }) {
    this.type = input.type
    this.organization = input.organization
    this.dateOfBirth = input.dateOfBirth
    this.clinician = input.clinician
    this.language = input.language
    this.timeZone = input.timeZone
  }
}
