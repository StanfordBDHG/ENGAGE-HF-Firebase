import { type FHIRSimpleQuantity } from './fhir/baseTypes.js'

export interface UserMessagesSettings {
  dailyRemindersAreActive: boolean
  textNotificationsAreActive: boolean
  medicationRemindersAreActive: boolean
}

export interface User {
  dateOfBirth: Date
  dateOfEnrollment: Date
  invitationCode: string
  messagesSettings: UserMessagesSettings
  clinician?: string
  organization?: string
  language?: string
  timeZone?: string
  dryWeight?: FHIRSimpleQuantity
}

export interface UserRecord {
  displayName?: string
}
