//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type FhirAllergyIntolerance,
  type MedicationClassReference,
  type MedicationReference,
} from "@stanfordbdhg/engagehf-models";

export enum ContraindicationCategory {
  none = 0,
  clinicianListed = 1,
  allergyIntolerance = 2,
  severeAllergyIntolerance = 3,
}

export interface ContraindicationService {
  // Methods

  checkMedication(
    contraindications: FhirAllergyIntolerance[],
    medicationReference: MedicationReference,
  ): ContraindicationCategory;

  checkMedicationClass(
    contraindications: FhirAllergyIntolerance[],
    medicationClassReference: MedicationClassReference,
  ): ContraindicationCategory;

  findEligibleMedication(
    contraindications: FhirAllergyIntolerance[],
    medicationReferences: MedicationReference[],
  ): MedicationReference | undefined;
}
