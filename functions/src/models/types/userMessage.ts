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
import {
  FHIRReference,
  fhirReferenceConverter,
} from '../fhir/baseTypes/fhirReference.js'

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
          appointmentId: optionalish(z.string()),
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
        appointmentId: object.appointmentId ?? null,
      }),
    }),
)

export class UserMessage {
  // Static Functions

  static createMedicationChange(input: {
    creationDate?: Date
    medicationName: string
    videoReference: VideoReference
  }): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText({
        en: 'Medication Change',
      }),
      description: new LocalizedText({
        en: `Your dose of ${input.medicationName} was changed. You can review medication information on the Education Page.`,
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
        en: 'Eligible Medication Change',
      }),
      description: new LocalizedText({
        en: 'You may be eligible for med changes that may help your heart. Your care team will be sent this information. You can review med information on the Education Page.',
      }),
      action: 'medications',
      type: UserMessageType.medicationUptitration,
      isDismissible: true,
    })
  }

  static createPreAppointment(
    input: {
      creationDate?: Date
      appointmentId?: string
    } = {},
  ): UserMessage {
    return new UserMessage({
      creationDate: input.creationDate ?? new Date(),
      title: new LocalizedText({
        en: 'Appointment Reminder',
      }),
      description: new LocalizedText({
        en: 'Your appointment is coming up. Review your Health Summary before your visit.',
      }),
      action: 'healthSummary',
      type: UserMessageType.preAppointment,
      isDismissible: false,
      appointmentId: input.appointmentId,
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
      }),
      description: new LocalizedText({
        en: 'Complete your Symptom Survey for your care team.',
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
      }),
      description: new LocalizedText({
        en: 'Check your blood pressure and weight daily.',
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
        en: 'Weight increase since last week',
      }),
      description: new LocalizedText({
        en: 'Your weight increased over 3 lbs. Your care team will be informed. Please follow any instructions about diuretic changes after weight increase on the Medication page.',
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
      }),
      description: new LocalizedText({
        en: 'Watch Welcome Video on the Education Page.',
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
  readonly appointmentId?: string

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
    appointmentId?: string
  }) {
    this.creationDate = input.creationDate
    this.dueDate = input.dueDate
    this.completionDate = input.completionDate
    this.type = input.type
    this.title = input.title
    this.description = input.description
    this.action = input.action
    this.isDismissible = input.isDismissible
    this.appointmentId = input.appointmentId
  }
}
