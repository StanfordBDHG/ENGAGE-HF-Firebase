import {
  type FHIRSimpleQuantity,
  type FHIRCodeableConcept,
  type FHIRElement,
  type FHIRRatio,
  type FHIRReference,
} from './baseTypes.js'

export interface FHIRMedication extends FHIRElement {
  code?: FHIRCodeableConcept
  form?: FHIRCodeableConcept
  ingredient?: FHIRMedicationIngredient[]
}

export interface FHIRMedicationIngredient {
  strength?: FHIRRatio
  itemReference?: FHIRReference<FHIRMedication>
}

export interface FHIRMedicationRequest extends FHIRElement {
  medicationReference?: FHIRReference<FHIRMedication>
  dosageInstruction?: FHIRDosage[]
}

export interface FHIRDosage extends FHIRElement {
  text?: string
  patientInstruction?: string
  timing?: FHIRTiming
  doseAndRate?: FHIRDosageDoseAndRate[]
}

export interface FHIRDosageDoseAndRate extends FHIRElement {
  type?: FHIRCodeableConcept
  doseQuantity?: FHIRSimpleQuantity
  maxDosePerPeriod?: FHIRRatio
  maxDosePerAdministration?: FHIRSimpleQuantity
  maxDosePerLifetime?: FHIRSimpleQuantity
}

export interface FHIRTiming extends FHIRElement {
  repeat?: FHIRTimingRepeat
  code?: FHIRCodeableConcept
}

export interface FHIRTimingRepeat {
  timeOfDay?: string[]
}
