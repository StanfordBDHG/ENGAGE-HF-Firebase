import { type FHIRReference } from './fhir/baseTypes'
import {
  type FHIRMedication,
  type FHIRMedicationRequest,
} from './fhir/medication'
import { type MedicationClass } from './medicationClass'

export interface MedicationRequestContext {
  request: FHIRMedicationRequest
  requestReference: FHIRReference<FHIRMedicationRequest>
  drug?: FHIRMedication
  drugReference?: FHIRReference<FHIRMedication>
  medication?: FHIRMedication
  medicationReference?: FHIRReference<FHIRMedication>
  medicationClass?: MedicationClass
  medicationClassReference?: FHIRReference<MedicationClass>
}
