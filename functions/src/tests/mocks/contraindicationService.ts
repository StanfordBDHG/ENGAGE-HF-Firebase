//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { type FHIRAllergyIntolerance } from '../../models/fhir/allergyIntolerance.js'
import {
  type MedicationClassReference,
  type MedicationReference,
} from '../../services/codes.js'
import {
  type ContraindicationCategory,
  type ContraindicationService,
} from '../../services/contraindication/contraindicationService.js'

export class MockContraindicationService implements ContraindicationService {
  // Properties

  private readonly _checkMedication: (
    allergies: FHIRAllergyIntolerance[],
    medication: MedicationReference,
  ) => ContraindicationCategory
  private readonly _checkMedicationClass: (
    allergies: FHIRAllergyIntolerance[],
    medicationClass: MedicationClassReference,
  ) => ContraindicationCategory

  // Constructor

  constructor(
    checkMedication: (
      allergies: FHIRAllergyIntolerance[],
      medication: MedicationReference,
    ) => ContraindicationCategory,
    checkMedicationClass: (
      allergies: FHIRAllergyIntolerance[],
      medicationClass: MedicationClassReference,
    ) => ContraindicationCategory,
  ) {
    this._checkMedication = checkMedication
    this._checkMedicationClass = checkMedicationClass
  }

  // Methods

  checkMedication(
    contraindications: FHIRAllergyIntolerance[],
    medicationReference: MedicationReference,
  ): ContraindicationCategory {
    return this._checkMedication(contraindications, medicationReference)
  }

  checkMedicationClass(
    contraindications: FHIRAllergyIntolerance[],
    medicationClassReference: MedicationClassReference,
  ): ContraindicationCategory {
    return this._checkMedicationClass(
      contraindications,
      medicationClassReference,
    )
  }
}
