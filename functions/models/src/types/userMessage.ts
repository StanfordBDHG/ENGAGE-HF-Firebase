//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { LocalizedText, localizedTextConverter } from './localizedText.js'
import {
  type QuestionnaireReference,
  type VideoReference,
} from '../codes/references.js'
import { advanceDateByDays } from '../helpers/date+extras.js'
import { dateConverter } from '../helpers/dateConverter.js'
import { Lazy } from '../helpers/lazy.js'
import { optionalish } from '../helpers/optionalish.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'
import { messagesLocalization } from '../localization/messages.js'

export enum UserMessageType {
  medicationChange = 'MedicationChange',
  weightGain = 'WeightGain',
  medicationUptitration = 'MedicationUptitration',
  welcome = 'Welcome',
  vitals = 'Vitals',
  symptomQuestionnaire = 'SymptomQuestionnaire',
  preAppointment = 'PreAppointment',
  inactive = 'Inactive',
}

export const userMessageConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: z
        .object({
          creationDate: dateConverter.schema,
          dueDate: optionalish(dateConverter.schema),
          completionDate: optionalish(dateConverter.schema),
          type: z.nativeEnum(UserMessageType),
          title: z.lazy(() => localizedTextConverter.schema),
          description: optionalish(z.lazy(() => localizedTextConverter.schema)),
          action: optionalish(z.string()),
          isDismissible: z.boolean(),
          reference: optionalish(z.string()),
        })
        .transform((content) => new UserMessage(content)),
      encode: (object) => ({
        creationDate: dateConverter.encode(object.creationDate),
        dueDate: object.dueDate ? dateConverter.encode(object.dueDate) : null,
        completionDate:
          object.completionDate ?
            dateConverter.encode(object.completionDate)
          : null,
        type: object.type,
        title: localizedTextConverter.encode(object.title),
        description:
          object.description ?
            localizedTextConverter.encode(object.description)
          : null,
        action: object.action ?? null,
        isDismissible: object.isDismissible,
        reference: object.reference ?? null,
      }),
    }),
)

export class UserMessage {
  // Static Functions

  static createInactive(
    input: {
      creationDate?: Date
    } = {},
  ): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText(messagesLocalization.inactiveTitle),
      description: new LocalizedText(messagesLocalization.inactiveDescription),
      action: undefined,
      type: UserMessageType.inactive,
      isDismissible: false,
    })
  }

  static createInactiveForClinician(input: {
    creationDate?: Date
    userId: string
    userName?: string
    reference: string
  }): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText(messagesLocalization.inactiveTitle),
      description:
        input.userName !== undefined ?
          LocalizedText.parametrized(
            messagesLocalization.inactiveDescriptionForClinician,
            input.userName,
          )
        : new LocalizedText(
            messagesLocalization.inactiveDescriptionForClinicianNoName,
          ),
      action: `users/${input.userId}`,
      type: UserMessageType.inactive,
      isDismissible: true,
      reference: input.reference,
    })
  }

  static createMedicationChange(input: {
    creationDate?: Date
    reference: string
    medicationName: string
    videoReference?: string
  }): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText(messagesLocalization.medicationChangeTitle),
      description: LocalizedText.parametrized(
        messagesLocalization.medicationChangeDescription,
        input.medicationName,
      ),
      action: input.videoReference,
      type: UserMessageType.medicationChange,
      isDismissible: true,
      reference: input.reference,
    })
  }

  static createMedicationUptitration(
    input: {
      creationDate?: Date
      reference?: string
    } = {},
  ): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText(messagesLocalization.medicationUptitrationTitle),
      description: new LocalizedText(
        messagesLocalization.medicationUptitrationDescription,
      ),
      reference: input.reference,
      action: 'medications',
      type: UserMessageType.medicationUptitration,
      isDismissible: true,
    })
  }

  static createMedicationUptitrationForClinician(input: {
    creationDate?: Date
    userId: string
    userName?: string
    reference: string
  }): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText(
        messagesLocalization.medicationUptitrationTitleForClinician,
      ),
      description:
        input.userName !== undefined ?
          LocalizedText.parametrized(
            messagesLocalization.medicationUptitrationDescriptionForClinician,
            input.userName,
          )
        : new LocalizedText(
            messagesLocalization.medicationUptitrationDescriptionForClinicianNoName,
          ),
      reference: input.reference,
      action: `users/${input.userId}/medications`,
      type: UserMessageType.medicationUptitration,
      isDismissible: true,
    })
  }

  static createPreAppointment(input: {
    creationDate?: Date
    reference: string
  }): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText(messagesLocalization.preAppointmentTitle),
      description: new LocalizedText(
        messagesLocalization.preAppointmentDescription,
      ),
      action: 'healthSummary',
      type: UserMessageType.preAppointment,
      isDismissible: false,
      reference: input.reference,
    })
  }

  static createPreAppointmentForClinician(input: {
    creationDate?: Date
    userId: string
    userName?: string
    reference: string
  }): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText(
        messagesLocalization.preAppointmentTitleForClinician,
      ),
      description:
        input.userName !== undefined ?
          LocalizedText.parametrized(
            messagesLocalization.preAppointmentDescriptionForClinician,
            input.userName,
          )
        : new LocalizedText(
            messagesLocalization.preAppointmentDescriptionForClinicianNoName,
          ),
      action: `users/${input.userId}/appointments`,
      reference: input.reference,
      type: UserMessageType.preAppointment,
      isDismissible: true,
    })
  }

  static createSymptomQuestionnaire(input: {
    creationDate?: Date
    questionnaireReference: QuestionnaireReference
  }): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText(messagesLocalization.symptomQuestionnaireTitle),
      description: new LocalizedText(
        messagesLocalization.symptomQuestionnaireDescription,
      ),
      action: input.questionnaireReference,
      type: UserMessageType.symptomQuestionnaire,
      isDismissible: false,
    })
  }

  static createVitals(
    input: {
      creationDate?: Date
    } = {},
  ): UserMessage {
    const creationDate = input.creationDate ?? new Date()
    return new UserMessage({
      creationDate: creationDate,
      dueDate: advanceDateByDays(creationDate, 1),
      title: new LocalizedText(messagesLocalization.vitalsTitle),
      description: new LocalizedText(messagesLocalization.vitalsDescription),
      action: 'observations',
      type: UserMessageType.vitals,
      isDismissible: false,
    })
  }

  static createWeightGain(
    input: {
      creationDate?: Date
    } = {},
  ): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText(messagesLocalization.weightGainTitle),
      description: new LocalizedText(
        messagesLocalization.weightGainDescription,
      ),
      action: 'medications',
      type: UserMessageType.weightGain,
      isDismissible: true,
    })
  }

  static createWeightGainForClinician(input: {
    creationDate?: Date
    userId: string
    userName?: string
    reference: string
  }): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText(
        messagesLocalization.weightGainTitleForClinician,
      ),
      description:
        input.userName !== undefined ?
          LocalizedText.parametrized(
            messagesLocalization.weightGainDescriptionForClinician,
            input.userName,
          )
        : new LocalizedText(
            messagesLocalization.weightGainDescriptionForClinicianNoName,
          ),
      action: `users/${input.userId}/medications`,
      reference: input.reference,
      type: UserMessageType.weightGain,
      isDismissible: true,
    })
  }

  static createWelcome(input: {
    creationDate?: Date
    videoReference: VideoReference
  }): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText(messagesLocalization.welcomeTitle),
      description: new LocalizedText(messagesLocalization.welcomeDescription),
      action: input.videoReference,
      type: UserMessageType.welcome,
      isDismissible: true,
    })
  }

  // Properties

  readonly creationDate: Date
  readonly dueDate?: Date
  readonly completionDate?: Date
  readonly type: UserMessageType
  readonly title: LocalizedText
  readonly description?: LocalizedText
  readonly action?: string
  readonly isDismissible: boolean
  readonly reference?: string

  // Constructor

  constructor(input: {
    creationDate: Date
    dueDate?: Date
    completionDate?: Date
    type: UserMessageType
    title: LocalizedText
    description?: LocalizedText
    action?: string
    isDismissible: boolean
    reference?: string
  }) {
    this.creationDate = input.creationDate
    this.dueDate = input.dueDate
    this.completionDate = input.completionDate
    this.type = input.type
    this.title = input.title
    this.description = input.description
    this.action = input.action
    this.isDismissible = input.isDismissible
    this.reference = input.reference
  }
}
