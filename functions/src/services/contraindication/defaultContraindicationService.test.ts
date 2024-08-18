//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import fs from 'fs'
import { expect } from 'chai'
import { describe } from 'mocha'
import { DefaultContraindicationService } from './defaultContraindicationService.js'
import {
  FHIRAllergyIntolerance,
  FHIRAllergyIntoleranceCriticality,
  FHIRAllergyIntoleranceType,
} from '../../models/fhir/fhirAllergyIntolerance.js'
import { MedicationClassReference, MedicationReference } from '../references.js'
import { ContraindicationCategory } from './contraindicationService.js'

describe('DefaultContraindicationService', () => {
  const contraindicationService = new DefaultContraindicationService()

  function check(
    field: string,
    options: {
      reference: MedicationReference
      type: FHIRAllergyIntoleranceType
      criticality: FHIRAllergyIntoleranceCriticality
      category: ContraindicationCategory
    },
  ) {
    const contraindications = [
      FHIRAllergyIntolerance.create({
        type: options.type,
        criticality: options.criticality,
        reference: options.reference,
      }),
    ]

    const { medications, medicationClasses } = references(field)

    medications.forEach((medication) => {
      const category = contraindicationService.checkMedication(
        contraindications,
        medication,
      )
      expect(category).to.equal(options.category)
    })

    medicationClasses.forEach((medicationClass) => {
      const category = contraindicationService.checkMedicationClass(
        contraindications,
        medicationClass,
      )
      expect(category).to.equal(options.category)
    })
  }

  it('correctly specifies contraindications as documented in reference', () => {
    const fileContents = fs.readFileSync(
      'src/tests/resources/contraindications.csv',
      'utf8',
    )
    const lines = fileContents.split('\n').slice(1)
    expect(lines).to.have.length(35)

    for (const line of lines) {
      const fields = line.split(',')
      expect(fields).to.have.length(15)

      const medicationReference = Object.values(MedicationReference).find(
        (value) => value === 'medications/' + fields[0],
      )

      expect(medicationReference).to.not.be.undefined
      if (medicationReference === undefined)
        throw new Error('Medication reference not found')

      console.log('Checking allergies for', medicationReference)
      check(fields[10], {
        reference: medicationReference,
        type: FHIRAllergyIntoleranceType.allergy,
        criticality: FHIRAllergyIntoleranceCriticality.low,
        category: ContraindicationCategory.allergyIntolerance,
      })

      console.log('Checking severe allergies for', medicationReference)
      check(fields[11], {
        reference: medicationReference,
        type: FHIRAllergyIntoleranceType.allergy,
        criticality: FHIRAllergyIntoleranceCriticality.high,
        category: ContraindicationCategory.severeAllergyIntolerance,
      })

      console.log('Checking intolerances for', medicationReference)
      check(fields[12], {
        reference: medicationReference,
        type: FHIRAllergyIntoleranceType.intolerance,
        criticality: FHIRAllergyIntoleranceCriticality.low,
        category: ContraindicationCategory.clinicianListed,
      })

      console.log(
        'Checking financial contraindications for',
        medicationReference,
      )
      check(fields[14], {
        reference: medicationReference,
        type: FHIRAllergyIntoleranceType.financial,
        criticality: FHIRAllergyIntoleranceCriticality.low,
        category: ContraindicationCategory.clinicianListed,
      })
    }
  })
})

function references(field: string): {
  medications: Set<MedicationReference>
  medicationClasses: Set<MedicationClassReference>
} {
  const result = {
    medications: new Set<MedicationReference>(),
    medicationClasses: new Set<MedicationClassReference>(),
  }

  field.split('/').forEach((value) => {
    switch (value.trim()) {
      case 'ACEI':
        result.medicationClasses.add(
          MedicationClassReference.angiotensinConvertingEnzymeInhibitors,
        )
        break
      case 'ARB':
        result.medicationClasses.add(
          MedicationClassReference.angiotensinReceptorBlockers,
        )
        break
      case 'ARNI':
        result.medicationClasses.add(
          MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
        )
        break
      case 'BB':
        result.medicationClasses.add(MedicationClassReference.betaBlockers)
        break
      case 'MRA':
        result.medicationClasses.add(
          MedicationClassReference.mineralocorticoidReceptorAntagonists,
        )
        break
      case 'SGLT':
        result.medicationClasses.add(MedicationClassReference.sglt2inhibitors)
        break

      case 'Bexagliflozin':
        result.medications.add(MedicationReference.bexagliflozin)
        break
      case 'Canagliflozin':
        result.medications.add(MedicationReference.canagliflozin)
        break
      case 'Carvedilol':
        result.medications.add(MedicationReference.carvedilol)
        result.medications.add(MedicationReference.carvedilolPhosphate)
        break
      case 'Dapagliflozin':
        result.medications.add(MedicationReference.dapagliflozin)
        break
      case 'Empagliflozin':
        result.medications.add(MedicationReference.empagliflozin)
        break
      case 'Eplerenone':
        result.medications.add(MedicationReference.eplerenone)
        break
      case 'Ertugliflozin':
        result.medications.add(MedicationReference.ertugliflozin)
        break
      case 'Losartan':
        result.medications.add(MedicationReference.losartan)
        break
      case 'Metoprolol':
        result.medications.add(MedicationReference.metoprololSuccinate)
        break
      case 'Sotagliflozin':
        result.medications.add(MedicationReference.sotagliflozin)
        break
      case 'Spironolactone':
        result.medications.add(MedicationReference.spironolactone)
        break
      default:
        console.error(
          'Unknown medication or medication class reference:',
          value,
        )
        break
    }
  })

  return result
}
