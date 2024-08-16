//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type FHIRMedicationRequest } from './fhir/baseTypes/fhirElement.js'
import { type FHIRReference } from './fhir/baseTypes/fhirReference.js'
import { type FHIRMedication } from './fhir/fhirMedication.js'
import { type MedicationClass } from './types/medicationClass.js'

export interface MedicationRequestContext {
  request: FHIRMedicationRequest
  requestReference: FHIRReference
  drug: FHIRMedication
  drugReference: FHIRReference
  medication: FHIRMedication
  medicationReference: FHIRReference
  medicationClass: MedicationClass
  medicationClassReference: FHIRReference
}
