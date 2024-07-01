import {
  type FHIRCodeableConcept,
  type FHIRElement,
  type FHIRPeriod,
  type FHIRSimpleQuantity,
} from './baseTypes.js'

export enum FHIRObservationStatus {
  registered = 'registered',
  preliminary = 'preliminary',
  final = 'final',
  amended = 'amended',
  corrected = 'corrected',
  cancelled = 'cancelled',
  entered_in_error = 'entered-in-error',
  unknown = 'unknown',
}

export interface FHIRObservationComponent {
  code: FHIRCodeableConcept
  valueQuantity?: FHIRSimpleQuantity
}

export interface FHIRObservation extends FHIRElement {
  status: FHIRObservationStatus
  code: FHIRCodeableConcept
  component: FHIRObservationComponent[]
  valueQuantity?: FHIRSimpleQuantity
  effectivePeriod?: FHIRPeriod
  effectiveDateTime?: Date
  effectiveInstant?: Date
}
