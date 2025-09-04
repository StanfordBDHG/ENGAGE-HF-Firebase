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
import {
  type ContraindicationCategory,
  type ContraindicationService,
} from "../../services/contraindication/contraindicationService.js";

export class MockContraindicationService implements ContraindicationService {
  // Properties

  private readonly _checkMedication: (
    allergies: FhirAllergyIntolerance[],
    medication: MedicationReference,
  ) => ContraindicationCategory;
  private readonly _checkMedicationClass: (
    allergies: FhirAllergyIntolerance[],
    medicationClass: MedicationClassReference,
  ) => ContraindicationCategory;
  private readonly _findEligibleMedication: (
    allergies: FhirAllergyIntolerance[],
    medicationReferences: MedicationReference[],
  ) => MedicationReference | undefined;

  // Constructor

  constructor(
    checkMedication: (
      allergies: FhirAllergyIntolerance[],
      medication: MedicationReference,
    ) => ContraindicationCategory,
    checkMedicationClass: (
      allergies: FhirAllergyIntolerance[],
      medicationClass: MedicationClassReference,
    ) => ContraindicationCategory,
    findEligibleMedication: (
      allergies: FhirAllergyIntolerance[],
      medicationReferences: MedicationReference[],
    ) => MedicationReference | undefined,
  ) {
    this._checkMedication = checkMedication;
    this._checkMedicationClass = checkMedicationClass;
    this._findEligibleMedication = findEligibleMedication;
  }

  // Methods

  checkMedication(
    contraindications: FhirAllergyIntolerance[],
    medicationReference: MedicationReference,
  ): ContraindicationCategory {
    return this._checkMedication(contraindications, medicationReference);
  }

  checkMedicationClass(
    contraindications: FhirAllergyIntolerance[],
    medicationClassReference: MedicationClassReference,
  ): ContraindicationCategory {
    return this._checkMedicationClass(
      contraindications,
      medicationClassReference,
    );
  }

  findEligibleMedication(
    contraindications: FhirAllergyIntolerance[],
    medicationReferences: MedicationReference[],
  ): MedicationReference | undefined {
    return this._findEligibleMedication(
      contraindications,
      medicationReferences,
    );
  }
}
