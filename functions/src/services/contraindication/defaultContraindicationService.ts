//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  ContraindicationCategory,
  type ContraindicationService,
} from './contraindicationService.js'
import {
  type FHIRAllergyIntolerance,
  FHIRAllergyIntoleranceCriticality,
  FHIRAllergyIntoleranceType,
} from '../../models/fhir/fhirAllergyIntolerance.js'
import { CodingSystem } from '../codes.js'
import { MedicationClassReference, MedicationReference } from '../references.js'

export class DefaultContraindicationService implements ContraindicationService {
  // Properties

  /// Medication class contraindications
  /// - Key: SNOMED CT code used in FHIRAllergyIntolerance
  /// - Value: List of Medication references
  private readonly snomedMedicationContraindications = new Map<
    string,
    MedicationReference[]
  >([
    ['293472002', [MedicationReference.spironolactone]],
    ['470681000124105', [MedicationReference.eplerenone]],
    ['471761000124104', [MedicationReference.dapagliflozin]],
    ['471811000124106', [MedicationReference.empagliflozin]],
  ])

  /// Medication class contraindications
  /// - Key: SNOMED CT code used in FHIRAllergyIntolerance
  /// - Value: List of MedicationClass references
  private readonly snomedMedicationClassContraindications = new Map<
    string,
    MedicationClassReference[]
  >([
    ['293963004', [MedicationClassReference.betaBlockers]],
    ['293962009', [MedicationClassReference.betaBlockers]],
    ['292419005', [MedicationClassReference.betaBlockers]],
    ['292420004', [MedicationClassReference.betaBlockers]],
    [
      '295009002',
      [MedicationClassReference.mineralocorticoidReceptorAntagonists],
    ],
    [
      '470181000124100',
      [MedicationClassReference.mineralocorticoidReceptorAntagonists],
    ],
    [
      '295007000',
      [MedicationClassReference.mineralocorticoidReceptorAntagonists],
    ],
    ['470691000124108', [MedicationClassReference.sglt2inhibitors]],
    ['1208353007', [MedicationClassReference.sglt2inhibitors]],
    ['471811000124106', [MedicationClassReference.sglt2inhibitors]],
    [
      '371627004',
      [
        MedicationClassReference.angiotensinConvertingEnzymeInhibitors,
        MedicationClassReference.angiotensinReceptorBlockers,
        MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
      ],
    ],
    [
      '407590002',
      [
        MedicationClassReference.angiotensinReceptorBlockers,
        MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
      ],
    ],
    [
      '293500009',
      [MedicationClassReference.angiotensinConvertingEnzymeInhibitors],
    ],
  ])

  // Methods

  checkMedication(
    contraindications: FHIRAllergyIntolerance[],
    medicationReference: MedicationReference,
  ): ContraindicationCategory {
    const rxNormCode = medicationReference.split('/').at(-1)
    return this.checkAll(
      contraindications,
      [CodingSystem.snomedCt, CodingSystem.rxNorm],
      (system, code) => {
        switch (system) {
          case CodingSystem.snomedCt:
            return (
              this.snomedMedicationContraindications
                .get(code)
                ?.includes(medicationReference) ?? false
            )
          case CodingSystem.rxNorm:
            return code === rxNormCode
          default:
            return false
        }
      },
    )
  }

  checkMedicationClass(
    contraindications: FHIRAllergyIntolerance[],
    medicationClassReference: MedicationClassReference,
  ): ContraindicationCategory {
    return this.checkAll(
      contraindications,
      [CodingSystem.snomedCt],
      (_, code) => {
        return (
          this.snomedMedicationClassContraindications
            .get(code)
            ?.includes(medicationClassReference) ?? false
        )
      },
    )
  }

  // Helpers

  private checkAll(
    contraindications: FHIRAllergyIntolerance[],
    systems: CodingSystem[],
    check: (system: CodingSystem, code: string) => boolean,
  ): ContraindicationCategory {
    const categories = contraindications.map((contraindication) => {
      if (!this.check(contraindication, systems, check))
        return ContraindicationCategory.none
      if (
        contraindication.criticality === FHIRAllergyIntoleranceCriticality.high
      )
        return ContraindicationCategory.severeAllergyIntolerance
      return this.category(contraindication.type)
    })
    if (categories.includes(ContraindicationCategory.severeAllergyIntolerance))
      return ContraindicationCategory.severeAllergyIntolerance
    if (categories.includes(ContraindicationCategory.allergyIntolerance))
      return ContraindicationCategory.allergyIntolerance
    if (categories.includes(ContraindicationCategory.clinicianListed))
      return ContraindicationCategory.clinicianListed
    return ContraindicationCategory.none
  }

  private check(
    contraindication: FHIRAllergyIntolerance,
    systems: CodingSystem[],
    check: (system: CodingSystem, code: string) => boolean,
  ): boolean {
    for (const system of systems) {
      const codes = contraindication.codes(contraindication.code, {
        system: system,
      })
      for (const code of codes) {
        if (check(system, code)) return true
      }
    }
    return false
  }

  private category(type: FHIRAllergyIntoleranceType): ContraindicationCategory {
    switch (type) {
      case FHIRAllergyIntoleranceType.allergy:
      case FHIRAllergyIntoleranceType.intolerance:
        return ContraindicationCategory.allergyIntolerance
      case FHIRAllergyIntoleranceType.financial:
      case FHIRAllergyIntoleranceType.preference:
        return ContraindicationCategory.clinicianListed
    }
  }
}
