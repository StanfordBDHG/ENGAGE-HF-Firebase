//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  AppointmentStatus,
  type FHIRAppointment,
} from '../../../models/fhir/appointment.js'
import { type FHIRMedicationRequest } from '../../../models/fhir/medication.js'
import {
  type FHIRObservation,
  FHIRObservationStatus,
} from '../../../models/fhir/observation.js'
import { type FHIRQuestionnaireResponse } from '../../../models/fhir/questionnaireResponse.js'
import { type UserMessage, UserMessageType } from '../../../models/message.js'
import { type SymptomQuestionnaireResponse } from '../../../models/symptomQuestionnaireResponse.js'
import { CodingSystem, type DrugReference, LoincCode } from '../../codes.js'
import { QuantityUnit } from '../../fhir/quantityUnit.js'
import { symptomQuestionnaireLinkIds } from '../../fhir/symptomQuestionnaireLinkIds.js'

export class UserDebugDataFactory {
  // Properties

  private readonly loincDisplay = new Map<LoincCode, string>([
    [
      LoincCode.bloodPressure,
      'Blood pressure panel with all children optional',
    ],
    [LoincCode.systolicBloodPressure, 'Systolic blood pressure'],
    [LoincCode.diastolicBloodPressure, 'Diastolic blood pressure'],
    [LoincCode.bodyWeight, 'Body weight'],
    [LoincCode.creatinine, 'Creatinine [Mass/volume] in Serum or Plasma'],
    [
      LoincCode.estimatedGlomerularFiltrationRate,
      'Glomerular filtration rate/1.73 sq M.predicted [Volume Rate/Area] in Serum, Plasma or Blood by Creatinine-based formula (CKD-EPI 2021)',
    ],
    [LoincCode.heartRate, 'Heart rate'],
    [LoincCode.potassium, 'Potassium [Moles/volume] in Blood'],
  ])

  // Methods - Appointments

  appointment(input: {
    userId: string
    created: Date
    status: AppointmentStatus
    start: Date
    durationInMinutes: number
  }): FHIRAppointment {
    return {
      status: AppointmentStatus.booked,
      created: input.created,
      start: input.start,
      end: new Date(
        input.start.getTime() + input.durationInMinutes * 60 * 1000,
      ),
      participant: [
        {
          actor: {
            reference: `users/${input.userId}`,
          },
        },
      ],
    }
  }

  // Methods - MedicationRequests

  medicationRequest(input: {
    drugReference: DrugReference
    frequencyPerDay: number
    quantity: number
  }): FHIRMedicationRequest {
    return {
      medicationReference: {
        reference: input.drugReference,
      },
      dosageInstruction: [
        {
          timing: {
            repeat: {
              frequency: input.frequencyPerDay,
              period: 1,
              periodUnit: 'd',
            },
          },
          doseAndRate: [
            {
              doseQuantity: {
                ...QuantityUnit.tablet,
                value: input.quantity,
              },
            },
          ],
        },
      ],
    }
  }

  // Methods - Messages

  medicationChangeMessage(input: { videoReference: string }): UserMessage {
    return {
      title: {
        en: 'Medication Change',
        de: 'Änderung der Medikation',
      },
      description: {
        en: 'Your medication has been changed. Watch the video for more information.',
        de: 'Ihre Medikation wurde geändert. Sehen Sie sich das Video für weitere Informationen an.',
      },
      action: input.videoReference,
      type: UserMessageType.medicationChange,
      isDismissible: true,
    }
  }

  weightGainMessage(): UserMessage {
    return {
      title: {
        en: 'Weight Gain',
        de: 'Gewichtszunahme',
      },
      description: {
        en: 'Your weight has increased. Please contact your clinician.',
        de: 'Ihr Gewicht hat zugenommen. Bitte kontaktieren Sie Ihre:n Ärzt:in.',
      },
      action: 'medications',
      type: UserMessageType.weightGain,
      isDismissible: true,
    }
  }

  medicationUptitrationMessage(): UserMessage {
    return {
      title: {
        en: 'Medication Uptitration',
        de: 'Medikationserhöhung',
      },
      description: {
        en: 'Your medication is eligible to be increased. Please contact your clinician.',
        de: 'Ihre Medikation kann erhöht werden. Bitte kontaktieren Sie Ihre:n Ärzt:in.',
      },
      action: 'medications',
      type: UserMessageType.medicationUptitration,
      isDismissible: true,
    }
  }

  welcomeMessage(input: { videoReference: string }): UserMessage {
    return {
      title: {
        en: 'Welcome',
        de: 'Willkommen',
      },
      description: {
        en: 'Welcome to the ENGAGE-HF app.',
        de: 'Willkommen bei der ENGAGE-HF-App.',
      },
      action: input.videoReference,
      type: UserMessageType.welcome,
      isDismissible: true,
    }
  }

  vitalsMessage(): UserMessage {
    return {
      title: {
        en: 'Vitals',
        de: 'Vitalwerte',
      },
      description: {
        en: 'Please take blood pressure and weight measurements.',
        de: 'Bitte nehmen Sie Blutdruck- und Gewichtsmessungen vor.',
      },
      action: 'observations',
      type: UserMessageType.vitals,
      isDismissible: false,
    }
  }

  symptomQuestionnaireMessage(input: {
    questionnaireReference: string
  }): UserMessage {
    return {
      title: {
        en: 'Symptom Questionnaire',
        de: 'Symptomfragebogen',
      },
      description: {
        en: 'Please complete the symptom questionnaire.',
        de: 'Bitte füllen Sie den Symptomfragebogen aus.',
      },
      action: input.questionnaireReference,
      type: UserMessageType.symptomQuestionnaire,
      isDismissible: false,
    }
  }

  preAppointmentMessage(): UserMessage {
    return {
      title: {
        en: 'Appointment Reminder',
        de: 'Terminerinnerung',
      },
      description: {
        en: 'Your appointment is coming up.',
        de: 'Ihr Termin steht bevor.',
      },
      action: 'healthSummary',
      type: UserMessageType.preAppointment,
      isDismissible: false,
    }
  }

  // Methods - Observations

  bloodPressureObservation(input: {
    date: Date
    systolic: number
    diastolic: number
  }): FHIRObservation {
    return {
      status: FHIRObservationStatus.final,
      code: {
        coding: [
          {
            system: CodingSystem.loinc,
            code: LoincCode.bloodPressure,
            display: this.loincDisplay.get(LoincCode.bloodPressure),
          },
        ],
      },
      component: [
        {
          code: {
            coding: [
              {
                system: CodingSystem.loinc,
                code: LoincCode.systolicBloodPressure,
                display: this.loincDisplay.get(LoincCode.systolicBloodPressure),
              },
            ],
          },
          valueQuantity: {
            value: input.systolic,
            unit: QuantityUnit.mmHg.unit,
            system: QuantityUnit.mmHg.system,
            code: QuantityUnit.mmHg.code,
          },
        },
        {
          code: {
            coding: [
              {
                system: CodingSystem.loinc,
                code: LoincCode.diastolicBloodPressure,
                display: this.loincDisplay.get(
                  LoincCode.diastolicBloodPressure,
                ),
              },
            ],
          },
          valueQuantity: {
            value: input.diastolic,
            unit: QuantityUnit.mmHg.unit,
            system: QuantityUnit.mmHg.system,
            code: QuantityUnit.mmHg.code,
          },
        },
      ],
      effectiveDateTime: input.date,
    }
  }

  observation(input: {
    date: Date
    value: number
    unit: QuantityUnit
    code: LoincCode
  }) {
    return {
      status: FHIRObservationStatus.final,
      code: {
        coding: [
          {
            system: CodingSystem.loinc,
            code: input.code,
            display: this.loincDisplay.get(input.code),
          },
        ],
      },
      valueQuantity: {
        value: input.value,
        unit: input.unit.unit,
        system: input.unit.system,
        code: input.unit.code,
      },
      effectiveDateTime: input.date,
    }
  }

  // Methods - QuestionnaireResponses

  questionnaireResponse(
    input: SymptomQuestionnaireResponse,
  ): FHIRQuestionnaireResponse {
    const linkIds = symptomQuestionnaireLinkIds(input.questionnaire)

    return {
      id: input.questionnaireResponse,
      questionnaire: input.questionnaire,
      authored: input.date,
      item: [
        {
          linkId: linkIds.question1a,
          answer: [{ valueCoding: { code: input.answer1a.toString() } }],
        },
        {
          linkId: linkIds.question1b,
          answer: [{ valueCoding: { code: input.answer1b.toString() } }],
        },
        {
          linkId: linkIds.question1c,
          answer: [{ valueCoding: { code: input.answer1c.toString() } }],
        },
        {
          linkId: linkIds.question2,
          answer: [{ valueCoding: { code: input.answer2.toString() } }],
        },
        {
          linkId: linkIds.question3,
          answer: [{ valueCoding: { code: input.answer3.toString() } }],
        },
        {
          linkId: linkIds.question4,
          answer: [{ valueCoding: { code: input.answer4.toString() } }],
        },
        {
          linkId: linkIds.question5,
          answer: [{ valueCoding: { code: input.answer5.toString() } }],
        },
        {
          linkId: linkIds.question6,
          answer: [{ valueCoding: { code: input.answer6.toString() } }],
        },
        {
          linkId: linkIds.question7,
          answer: [{ valueCoding: { code: input.answer7.toString() } }],
        },
        {
          linkId: linkIds.question8a,
          answer: [{ valueCoding: { code: input.answer8a.toString() } }],
        },
        {
          linkId: linkIds.question8b,
          answer: [{ valueCoding: { code: input.answer8b.toString() } }],
        },
        {
          linkId: linkIds.question8c,
          answer: [{ valueCoding: { code: input.answer8c.toString() } }],
        },
        {
          linkId: linkIds.question9,
          answer: [{ valueCoding: { code: input.answer9.toString() } }],
        },
      ],
    }
  }
}
