//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

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
  currentMedication: Array<FHIRReference<FHIRMedicationRequest>>
  recommendedMedication?: FHIRReference<FHIRMedication>
  category: MedicationRecommendationCategory
}

export interface MedicationRecommendationContext {
  currentMedication: MedicationRequestContext[]
  recommendedMedication?: FHIRMedication
  category: MedicationRecommendationCategory
}
