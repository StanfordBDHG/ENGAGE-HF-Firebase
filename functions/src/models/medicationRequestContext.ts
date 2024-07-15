//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

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
