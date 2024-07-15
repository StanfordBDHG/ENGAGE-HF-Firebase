import { type FHIRSimpleQuantity } from './fhir/baseTypes'

export interface Vitals {
  systolicBloodPressure: Observation[]
  diastolicBloodPressure: Observation[]
  heartRate: Observation[]
  bodyWeight: Observation[]

  estimatedGlomerularFiltrationRate?: Observation
  potassium?: Observation
  creatinine?: Observation
  dryWeight?: Observation
}

export interface Observation {
  date: Date
  value: number
}

export interface QuantityObservation {
  date: Date
  valueQuantity: FHIRSimpleQuantity
}
