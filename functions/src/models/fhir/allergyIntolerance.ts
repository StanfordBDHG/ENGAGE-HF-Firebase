import { type FHIRCodeableConcept, type FHIRElement } from './baseTypes.js'

export enum FHIRAllergyIntoleranceType {
  allergy = 'allergy',
  intolerance = 'intolerance',
  financial = 'financial',
  preference = 'preference',
}

export enum FHIRAllergyIntoleranceCriticality {
  low = 'low',
  high = 'high',
  unableToAssess = 'unable-to-assess',
}

export interface FHIRAllergyIntolerance extends FHIRElement {
  type: FHIRAllergyIntoleranceType
  criticality?: FHIRAllergyIntoleranceCriticality
  code?: FHIRCodeableConcept
}
