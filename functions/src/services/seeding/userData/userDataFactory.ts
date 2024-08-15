//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { FHIRMedicationRequest } from '../../../models/fhir/baseTypes/fhirElement.js'
import {
  FHIRAppointment,
  type FHIRAppointmentStatus,
} from '../../../models/fhir/fhirAppointment.js'
import { FHIRObservation } from '../../../models/fhir/fhirObservation.js'
import { FHIRQuestionnaireResponse } from '../../../models/fhir/fhirQuestionnaireResponse.js'
import { type SymptomQuestionnaireResponse } from '../../../models/symptomQuestionnaireResponse.js'
import { UserMessage } from '../../../models/types/userMessage.js'
import { type LoincCode } from '../../codes.js'
import { type QuantityUnit } from '../../fhir/quantityUnit.js'
import {
  type DrugReference,
  type QuestionnaireReference,
  type VideoReference,
} from '../../references.js'

/* eslint-disable @typescript-eslint/no-extraneous-class */

export class UserDataFactory {
  // Properties

  // Constructor

  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  private constructor() {}

  // Methods - Appointments

  static appointment(input: {
    userId: string
    created: Date
    status: FHIRAppointmentStatus
    start: Date
    durationInMinutes: number
  }): FHIRAppointment {
    return FHIRAppointment.create(input)
  }

  // Methods - MedicationRequests

  static medicationRequest(input: {
    drugReference: DrugReference
    frequencyPerDay: number
    quantity: number
  }): FHIRMedicationRequest {
    return FHIRMedicationRequest.create(input)
  }

  // Methods - Messages

  static medicationChangeMessage(input: {
    creationDate?: Date
    videoReference: VideoReference
  }): UserMessage {
    return UserMessage.createMedicationChange(input)
  }

  static weightGainMessage(
    input: {
      creationDate?: Date
    } = {},
  ): UserMessage {
    return UserMessage.createWeightGain(input)
  }

  static medicationUptitrationMessage(
    input: {
      creationDate?: Date
    } = {},
  ): UserMessage {
    return UserMessage.createMedicationUptitration(input)
  }

  static welcomeMessage(input: {
    creationDate?: Date
    videoReference: VideoReference
  }): UserMessage {
    return UserMessage.createWelcome(input)
  }

  static vitalsMessage(
    input: {
      creationDate?: Date
    } = {},
  ): UserMessage {
    return UserMessage.createVitals(input)
  }

  static symptomQuestionnaireMessage(input: {
    creationDate?: Date
    questionnaireReference: QuestionnaireReference
  }): UserMessage {
    return UserMessage.createSymptomQuestionnaire(input)
  }

  static preAppointmentMessage(
    input: {
      creationDate?: Date
    } = {},
  ): UserMessage {
    return UserMessage.createPreAppointment(input)
  }

  // Methods - Observations

  static bloodPressureObservation(input: {
    id: string
    date: Date
    systolic: number
    diastolic: number
  }): FHIRObservation {
    return FHIRObservation.createBloodPressure(input)
  }

  static observation(input: {
    id: string
    date: Date
    value: number
    unit: QuantityUnit
    code: LoincCode
  }): FHIRObservation {
    return FHIRObservation.createSimple(input)
  }

  // Methods - QuestionnaireResponses

  static questionnaireResponse(
    input: SymptomQuestionnaireResponse,
  ): FHIRQuestionnaireResponse {
    return FHIRQuestionnaireResponse.create(input)
  }
}
