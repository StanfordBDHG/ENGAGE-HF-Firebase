//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { type LocalizedText } from './helpers.js'

export enum UserMessageType {
  medicationChange = 'MedicationChange',
  weightGain = 'WeightGain',
  medicationUptitration = 'MedicationUptitration',
  welcome = 'Welcome',
  vitals = 'Vitals',
  symptomQuestionnaire = 'SymptomQuestionnaire',
  preAppointment = 'PreAppointment',
}

export interface UserMessage {
  dueDate?: Date
  completionDate?: Date
  type: UserMessageType
  title: LocalizedText
  description?: LocalizedText
  action?: string
  isDismissable: boolean
}
