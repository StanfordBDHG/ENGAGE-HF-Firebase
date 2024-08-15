//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { LocalizedText, localizedTextConverter } from './localizedText.js'
import { Lazy } from '../../services/factory/lazy.js'
import {
  type QuestionnaireReference,
  type VideoReference,
} from '../../services/references.js'
import { dateConverter } from '../helpers/dateConverter.js'
import { optionalish } from '../helpers/optionalish.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'

export enum UserMessageType {
  medicationChange = 'MedicationChange',
  weightGain = 'WeightGain',
  medicationUptitration = 'MedicationUptitration',
  welcome = 'Welcome',
  vitals = 'Vitals',
  symptomQuestionnaire = 'SymptomQuestionnaire',
  preAppointment = 'PreAppointment',
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
        action: object.action,
        isDismissible: object.isDismissible,
      }),
    }),
)

export class UserMessage {
  // Static Functions

  static createMedicationChange(input: {
    creationDate?: Date
    videoReference: VideoReference
  }): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText({
        en: 'Medication Change',
        de: 'Änderung der Medikation',
      }),
      description: new LocalizedText({
        en: 'Your medication has been changed. Watch the video for more information.',
        de: 'Ihre Medikation wurde geändert. Sehen Sie sich das Video für weitere Informationen an.',
      }),
      action: input.videoReference,
      type: UserMessageType.medicationChange,
      isDismissible: true,
    })
  }

  static createMedicationUptitration(
    input: {
      creationDate?: Date
    } = {},
  ): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText({
        en: 'Medication Uptitration',
        de: 'Medikationserhöhung',
      }),
      description: new LocalizedText({
        en: 'Your medication is eligible to be increased. Please contact your clinician.',
        de: 'Ihre Medikation kann erhöht werden. Bitte kontaktieren Sie Ihre:n Ärzt:in.',
      }),
      action: 'medications',
      type: UserMessageType.medicationUptitration,
      isDismissible: true,
    })
  }

  static createPreAppointment(
    input: {
      creationDate?: Date
    } = {},
  ): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText({
        en: 'Appointment Reminder',
        de: 'Terminerinnerung',
      }),
      description: new LocalizedText({
        en: 'Your appointment is coming up.',
        de: 'Ihr Termin steht bevor.',
      }),
      action: 'healthSummary',
      type: UserMessageType.preAppointment,
      isDismissible: false,
    })
  }

  static createSymptomQuestionnaire(input: {
    creationDate?: Date
    questionnaireReference: QuestionnaireReference
  }): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText({
        en: 'Symptom Questionnaire',
        de: 'Symptomfragebogen',
      }),
      description: new LocalizedText({
        en: 'Please complete the symptom questionnaire.',
        de: 'Bitte füllen Sie den Symptomfragebogen aus.',
      }),
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
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText({
        en: 'Vitals',
        de: 'Vitalwerte',
      }),
      description: new LocalizedText({
        en: 'Please take blood pressure and weight measurements.',
        de: 'Bitte nehmen Sie Blutdruck- und Gewichtsmessungen vor.',
      }),
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
      title: new LocalizedText({
        en: 'Weight Gain',
        de: 'Gewichtszunahme',
      }),
      description: new LocalizedText({
        en: 'Your weight has increased. Please contact your clinician.',
        de: 'Ihr Gewicht hat zugenommen. Bitte kontaktieren Sie Ihre:n Ärzt:in.',
      }),
      action: 'medications',
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
      title: new LocalizedText({
        en: 'Welcome',
        de: 'Willkommen',
      }),
      description: new LocalizedText({
        en: 'Welcome to the ENGAGE-HF app.',
        de: 'Willkommen bei der ENGAGE-HF-App.',
      }),
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
  }) {
    this.creationDate = input.creationDate
    this.dueDate = input.dueDate
    this.completionDate = input.completionDate
    this.type = input.type
    this.title = input.title
    this.description = input.description
    this.action = input.action
    this.isDismissible = input.isDismissible
  }
}
