//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type FHIRAllergyIntolerance } from '../../models/fhir/fhirAllergyIntolerance.js'
import {
  type MedicationClassReference,
  type MedicationReference,
} from '../references.js'

export enum ContraindicationCategory {
  none,
  clinicianListed,
  allergyIntolerance,
  severeAllergyIntolerance,
}

export interface ContraindicationService {
  // Methods

  checkMedication(
    contraindications: FHIRAllergyIntolerance[],
    medicationReference: MedicationReference,
  ): ContraindicationCategory

  checkMedicationClass(
    contraindications: FHIRAllergyIntolerance[],
    medicationClassReference: MedicationClassReference,
  ): ContraindicationCategory
}
