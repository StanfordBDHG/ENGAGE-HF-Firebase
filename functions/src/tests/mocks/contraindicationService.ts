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
  ContraindicationCategory,
  type ContraindicationService,
} from '../../services/contraindication/contraindicationService.js'

export class MockContraindicationService implements ContraindicationService {
  // Properties

  private readonly severeAllergyIntoleranceMedications: MedicationReference[]
  private readonly allergyIntoleranceMedications: MedicationReference[]
  private readonly clinicianListedMedications: MedicationReference[]

  private readonly severeAllergyIntoleranceMedicationClasses: MedicationClassReference[]
  private readonly allergyIntoleranceMedicationClasses: MedicationClassReference[]
  private readonly clinicianListedMedicationClasses: MedicationClassReference[]

  // Constructor

  constructor(
    severeAllergyIntoleranceMedications: MedicationReference[],
    allergyIntoleranceMedications: MedicationReference[],
    clinicianListedMedications: MedicationReference[],
    severeAllergyIntoleranceMedicationClasses: MedicationClassReference[],
    allergyIntoleranceMedicationClasses: MedicationClassReference[],
    clinicianListedMedicationClasses: MedicationClassReference[],
  ) {
    this.severeAllergyIntoleranceMedications =
      severeAllergyIntoleranceMedications
    this.allergyIntoleranceMedications = allergyIntoleranceMedications
    this.clinicianListedMedications = clinicianListedMedications
    this.severeAllergyIntoleranceMedicationClasses =
      severeAllergyIntoleranceMedicationClasses
    this.allergyIntoleranceMedicationClasses =
      allergyIntoleranceMedicationClasses
    this.clinicianListedMedicationClasses = clinicianListedMedicationClasses
  }

  // Methods

  checkMedication(
    contraindications: FHIRAllergyIntolerance[],
    medicationReference: MedicationReference,
  ): ContraindicationCategory {
    if (
      this.severeAllergyIntoleranceMedications.includes(medicationReference)
    ) {
      return ContraindicationCategory.severeAllergyIntolerance
    }
    if (this.allergyIntoleranceMedications.includes(medicationReference)) {
      return ContraindicationCategory.allergyIntolerance
    }
    if (this.clinicianListedMedications.includes(medicationReference)) {
      return ContraindicationCategory.clinicianListed
    }
    return ContraindicationCategory.none
  }

  checkMedicationClass(
    contraindications: FHIRAllergyIntolerance[],
    medicationClassReference: MedicationClassReference,
  ): ContraindicationCategory {
    if (
      this.severeAllergyIntoleranceMedicationClasses.includes(
        medicationClassReference,
      )
    ) {
      return ContraindicationCategory.severeAllergyIntolerance
    }
    if (
      this.allergyIntoleranceMedicationClasses.includes(
        medicationClassReference,
      )
    ) {
      return ContraindicationCategory.allergyIntolerance
    }
    if (
      this.clinicianListedMedicationClasses.includes(medicationClassReference)
    ) {
      return ContraindicationCategory.clinicianListed
    }
    return ContraindicationCategory.none
  }
}
