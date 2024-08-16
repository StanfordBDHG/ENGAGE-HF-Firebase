//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import { describe } from 'mocha'
import { ContraindicationCategory } from './contraindicationService.js'
import { DefaultContraindicationService } from './defaultContraindicationService.js'
import {
  FHIRAllergyIntolerance,
  FHIRAllergyIntoleranceCriticality,
  FHIRAllergyIntoleranceType,
} from '../../models/fhir/fhirAllergyIntolerance.js'
import { CodingSystem } from '../codes.js'
import { MedicationClassReference, MedicationReference } from '../references.js'

describe('DefaultContraindicationService', () => {
  const contraindicationService = new DefaultContraindicationService()

  it('correctly checks for a simple medication class contraindication', () => {
    const contraindication = createFHIRAllergyIntolerance(
      FHIRAllergyIntoleranceType.allergy,
      FHIRAllergyIntoleranceCriticality.high,
      '371627004',
      CodingSystem.snomedCt,
    )
    const result = contraindicationService.checkMedicationClass(
      [contraindication],
      MedicationClassReference.angiotensinReceptorBlockers,
    )
    expect(result).to.equal(ContraindicationCategory.severeAllergyIntolerance)
  })

  it('correctly checks for a simple medication contraindication', () => {
    const contraindication = createFHIRAllergyIntolerance(
      FHIRAllergyIntoleranceType.allergy,
      FHIRAllergyIntoleranceCriticality.high,
      '471811000124106',
      CodingSystem.snomedCt,
    )
    const result = contraindicationService.checkMedication(
      [contraindication],
      MedicationReference.empagliflozin,
    )
    expect(result).to.equal(ContraindicationCategory.severeAllergyIntolerance)
  })
})

function createFHIRAllergyIntolerance(
  type: FHIRAllergyIntoleranceType,
  criticality: FHIRAllergyIntoleranceCriticality | undefined,
  code: string,
  system: CodingSystem,
): FHIRAllergyIntolerance {
  return new FHIRAllergyIntolerance({
    resourceType: 'AllergyIntolerance',
    type,
    criticality,
    code: {
      coding: [
        {
          system,
          code,
        },
      ],
    },
  })
}
