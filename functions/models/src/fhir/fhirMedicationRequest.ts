//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { Extension, MedicationRequest } from 'fhir/r4b.js'
import { FHIRResource } from './fhirResource.js'
import { medicationRequestSchema } from '@stanfordspezi/spezi-firebase-fhir'
import { QuantityUnit } from '../codes/quantityUnit.js'

export class FHIRMedicationRequest extends FHIRResource<MedicationRequest> {
  // Static Functions

  static create(input: {
    id?: string
    medicationReference: string
    medicationReferenceDisplay?: string
    frequencyPerDay: number
    quantity: number
    extension?: Extension[]
  }): FHIRMedicationRequest {
    return new FHIRMedicationRequest({
      id: input.id,
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

  // Computed Properties
}

/*
export const medicationRequestSchema =
  new FHIRSchemaConverter<FHIRMedicationRequest>({
    schema: medicationRequestSchema.transform(
      (data) => new FHIRMedicationRequest(data),
    ),
    nullProperties: [],
  })
*/