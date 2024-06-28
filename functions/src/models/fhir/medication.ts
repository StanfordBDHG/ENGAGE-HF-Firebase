import {
  type FHIRCodeableConcept,
  type FHIRElement,
  type FHIRRatio,
  type FHIRReference,
} from './baseTypes'

export interface FHIRMedication extends FHIRElement {
  code?: FHIRCodeableConcept
  ingredient?: FHIRMedicationIngredient[]
}

export interface FHIRMedicationIngredient {
  strength?: FHIRRatio
  itemReference?: FHIRReference<FHIRMedication>
}
