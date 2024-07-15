import { type FHIRReference } from './fhir/baseTypes.js'
import {
  type FHIRMedication,
  type FHIRMedicationRequest,
} from './fhir/medication.js'
import { type MedicationRequestContext } from './medicationRequestContext.js'

export enum MedicationRecommendationCategory {
  moreLabObservationsRequired = 'moreLabObservationsRequired',
  morePatientObservationsRequired = 'morePatientObservationsRequired',
  noActionRequired = 'noActionRequired',
  targetDoseReached = 'targetDoseReached',
  personalTargetDoseReached = 'personalTargetDoseReached',
  improvementAvailable = 'improvementAvailable',
  notStarted = 'notStarted',
}

export interface MedicationRecommendation {
  currentMedication?: FHIRReference<FHIRMedicationRequest>
  recommendedMedication?: FHIRReference<FHIRMedication>
  category: MedicationRecommendationCategory
}

export interface MedicationRecommendationContext {
  currentMedication?: MedicationRequestContext
  recommendedMedication?: FHIRMedication
  category: MedicationRecommendationCategory
}
