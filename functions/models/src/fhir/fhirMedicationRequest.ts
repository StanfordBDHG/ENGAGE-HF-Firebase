//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { Extension, MedicationRequest, Reference } from 'fhir/r4b'
import { FHIRResource } from './fhirResource'
import { QuantityUnit } from '../codes/quantityUnit'

export class FHIRMedicationRequest extends FHIRResource<MedicationRequest> {
  // Static Functions

  static create(input: {
    medicationReference: string
    medicationReferenceDisplay?: string
    frequencyPerDay: number
    quantity: number
    extension?: Extension[]
    userId: string
  }): FHIRMedicationRequest {
    return new FHIRMedicationRequest({
      resourceType: 'MedicationRequest',
      medicationReference: {
        reference: input.medicationReference,
        display: input.medicationReferenceDisplay,
      },
      intent: 'plan',
      status: 'draft',
      subject: {},
      extension: input.extension,
      dosageInstruction: [
        {
          timing: {
            repeat: {
              frequency: input.frequencyPerDay,
              period: 1,
              periodUnit: 'd',
            },
          },
          doseAndRate: [
            {
              doseQuantity: QuantityUnit.tablet.fhirQuantity(input.quantity),
            },
          ],
        },
      ],
    })
  }
}
