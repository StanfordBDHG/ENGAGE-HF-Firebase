//
// This source file is part of the ENGAGE-HF based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { type LocalizedText } from './helpers.js'

export enum UserMessageType {
  MedicationChange = 'MedicationChange',
  WeightGain = 'WeightGain',
  MedicationUptitration = 'MedicationUptitration',
  Welcome = 'Welcome',
  Vitals = 'Vitals',
  SymptomQuestionnaire = 'SymptomQuestionnaire',
  PreVisit = 'PreVisit',
}

export interface UserMessage {
  dueDate?: Date
  completionDate?: Date
  type?: UserMessageType
  title: LocalizedText
  description?: LocalizedText
  action?: string
}
