import { type LocalizedText } from './helpers'

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
