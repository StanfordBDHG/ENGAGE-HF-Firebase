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
import { type LocalizedText } from './helpers.js'

export enum MedicationRecommendationType {
  improvementAvailable = 'improvementAvailable',
  moreLabObservationsRequired = 'moreLabObservationsRequired',
  morePatientObservationsRequired = 'morePatientObservationsRequired',
  noActionRequired = 'noActionRequired',
  notStarted = 'notStarted',
  personalTargetDoseReached = 'personalTargetDoseReached',
  targetDoseReached = 'targetDoseReached',
}

export interface MedicationRecommendation {
  currentMedication: Array<FHIRReference<FHIRMedicationRequest>>
  recommendedMedication?: FHIRReference<FHIRMedication>
  displayInformation: MedicationRecommendationDisplayInformation
}

export interface MedicationRecommendationDisplayInformation {
  title: LocalizedText
  subtitle: LocalizedText
  description: LocalizedText
  type: MedicationRecommendationType
  dosageInformation: MedicationRecommendationDosageInformation
}

export interface MedicationRecommendationDosageInformation {
  currentSchedule: MedicationRecommendationDoseSchedule[]
  minimumSchedule: MedicationRecommendationDoseSchedule[]
  targetSchedule: MedicationRecommendationDoseSchedule[]
  unit: string
}

export interface MedicationRecommendationDoseSchedule {
  frequency: number
  quantity: number[]
}
