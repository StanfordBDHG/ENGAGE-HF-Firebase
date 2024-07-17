import { type FHIRSimpleQuantity } from './fhir/baseTypes.js'

export interface Patient {
  dateOfBirth: Date
  clinician?: string
  organization?: string
  dryWeight?: FHIRSimpleQuantity
}
