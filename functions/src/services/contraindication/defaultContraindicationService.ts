//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type FHIRAllergyIntolerance,
  MedicationClassReference,
  MedicationReference,
} from '@stanfordbdhg/engagehf-models'
import { type AllergyIntolerance } from 'fhir/r4b.js'
import { logger } from 'firebase-functions'
import {
  ContraindicationCategory,
  type ContraindicationService,
} from './contraindicationService.js'
import { medicationClassReference } from '../../models/medicationRequestContext.js'

interface ContraindicationRecord {
  category: ContraindicationCategory
  medications: Set<MedicationReference>
  medicationClasses: Set<MedicationClassReference>
}

export class DefaultContraindicationService implements ContraindicationService {
  // Properties

  readonly aceiArbMedicationClasses = [
    MedicationClassReference.angiotensinConvertingEnzymeInhibitors,
    MedicationClassReference.angiotensinReceptorBlockers,
  ]

  readonly arbArniMedicationClasses = [
    MedicationClassReference.angiotensinReceptorBlockers,
    MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
  ]

  readonly rasiMedicationClasses = [
    MedicationClassReference.angiotensinConvertingEnzymeInhibitors,
    MedicationClassReference.angiotensinReceptorBlockers,
    MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
  ]

  // Methods

  checkMedication(
    contraindications: FHIRAllergyIntolerance[],
    medicationReference: MedicationReference,
  ): ContraindicationCategory {
    const medicationClass = medicationClassReference(medicationReference)
    return this.checkAll(
      contraindications,
      (record) =>
        record.medications.has(medicationReference) ||
        record.medicationClasses.has(medicationClass),
    )
  }

  checkMedicationClass(
    contraindications: FHIRAllergyIntolerance[],
    medicationClassReference: MedicationClassReference,
  ): ContraindicationCategory {
    return this.checkAll(contraindications, (record) =>
      record.medicationClasses.has(medicationClassReference),
    )
  }

  findEligibleMedication(
    contraindications: FHIRAllergyIntolerance[],
    medicationReferences: MedicationReference[],
  ): MedicationReference | undefined {
    let availableMedications = medicationReferences

    this.checkAll(contraindications, (record) => {
      availableMedications = availableMedications.filter(
        (medication) =>
          !record.medications.has(medication) &&
          !record.medicationClasses.has(medicationClassReference(medication)),
      )
      return false
    })

    return availableMedications.at(0)
  }

  // Helpers

  private checkAll(
    contraindications: FHIRAllergyIntolerance[],
    isRelevant: (record: ContraindicationRecord) => boolean,
  ): ContraindicationCategory {
    let category = ContraindicationCategory.none
    for (const contraindication of contraindications) {
      const medicationReferences = contraindication.rxNormCodes.flatMap(
        (code) => {
          const reference = Object.values(MedicationReference).find(
            (value) => value.toString() === 'medications/' + code,
          )
          if (reference === undefined)
            logger.error(`Unknown RxNorm code in contraindication: ${code}`)
          return reference !== undefined ? [reference] : []
        },
      )

      for (const medicationReference of medicationReferences) {
        const record = this.record({
          medicationReference: medicationReference,
          type: contraindication.data.type,
          criticality: contraindication.data.criticality,
        })
        if (isRelevant(record)) category = Math.max(category, record.category)
      }
    }
    return category
  }

  private record(input: {
    medicationReference: MedicationReference
    type?: AllergyIntolerance['type']
    criticality?: AllergyIntolerance['criticality']
  }): ContraindicationRecord {
    const medicationClass = medicationClassReference(input.medicationReference)
    const medicationReferences = this.medicationReferenceIncludingDerivatives(
      input.medicationReference,
    )
    switch (input.type) {
      case 'allergy':
        if (input.criticality === 'high') {
          return {
            category: ContraindicationCategory.severeAllergyIntolerance,
            medications: medicationReferences,
            medicationClasses: new Set(
              this.rasiMedicationClasses.includes(medicationClass) ?
                this.rasiMedicationClasses
              : [medicationClass],
            ),
          }
        } else {
          return {
            category: ContraindicationCategory.allergyIntolerance,
            medications: medicationReferences,
            medicationClasses: new Set(
              this.arbArniMedicationClasses.includes(medicationClass) ?
                this.arbArniMedicationClasses
              : [medicationClass],
            ),
          }
        }
      case 'intolerance':
        switch (medicationClass) {
          case MedicationClassReference.angiotensinConvertingEnzymeInhibitors:
          case MedicationClassReference.angiotensinReceptorNeprilysinInhibitors:
            return {
              category: ContraindicationCategory.clinicianListed,
              medications: medicationReferences,
              medicationClasses: new Set([medicationClass]),
            }
          case MedicationClassReference.angiotensinReceptorBlockers:
            return {
              category: ContraindicationCategory.clinicianListed,
              medications: medicationReferences,
              medicationClasses: new Set(this.arbArniMedicationClasses),
            }
          default:
            return {
              category: ContraindicationCategory.clinicianListed,
              medications: medicationReferences,
              medicationClasses: new Set(),
            }
        }
      // TODO: case 'financial':
      // TODO: case 'preference':
      case undefined:
        return {
          category: ContraindicationCategory.clinicianListed,
          medications: medicationReferences,
          medicationClasses: new Set(
            this.aceiArbMedicationClasses.includes(medicationClass) ?
              this.rasiMedicationClasses
            : [medicationClass],
          ),
        }
    }
  }

  private medicationReferenceIncludingDerivatives(
    reference: MedicationReference,
  ): Set<MedicationReference> {
    switch (reference) {
      case MedicationReference.carvedilol:
      case MedicationReference.carvedilolPhosphate:
        return new Set([
          MedicationReference.carvedilol,
          MedicationReference.carvedilolPhosphate,
        ])
      default:
        return new Set([reference])
    }
  }
}
