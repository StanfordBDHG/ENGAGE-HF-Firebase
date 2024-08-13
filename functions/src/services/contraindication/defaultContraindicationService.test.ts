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
  type FHIRAllergyIntolerance,
  FHIRAllergyIntoleranceCriticality,
  FHIRAllergyIntoleranceType,
} from '../../models/fhir/allergyIntolerance.js'
import { CodingSystem } from '../codes.js'
import { FhirService } from '../fhir/fhirService.js'
import { MedicationClassReference, MedicationReference } from '../references.js'

describe('DefaultContraindicationService', () => {
  const fhirService = new FhirService()
  const contraindicationService = new DefaultContraindicationService(
    fhirService,
  )

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
  return {
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
  }
}
