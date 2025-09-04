//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  FhirMedicationRequest as BaseFhirMedicationRequest,
  medicationRequestSchema,
} from "@stanfordspezi/spezi-firebase-fhir";
import { type Extension } from "fhir/r4b.js";
import { QuantityUnit } from "../codes/quantityUnit.js";

export class FhirMedicationRequest extends BaseFhirMedicationRequest {
  // Static Properties

  static readonly schema = medicationRequestSchema.transform(
    (value) => new FhirMedicationRequest(value),
  );

  // Static Functions

  static create(input: {
    id?: string;
    medicationReference: string;
    medicationReferenceDisplay?: string;
    frequencyPerDay: number;
    quantity: number;
    extension?: Extension[];
  }): FhirMedicationRequest {
    return new FhirMedicationRequest({
      id: input.id,
      resourceType: "MedicationRequest",
      medicationReference: {
        reference: input.medicationReference,
        display: input.medicationReferenceDisplay,
      },
      intent: "plan",
      status: "draft",
      subject: {},
      extension: input.extension,
      dosageInstruction: [
        {
          timing: {
            repeat: {
              frequency: input.frequencyPerDay,
              period: 1,
              periodUnit: "d",
            },
          },
          doseAndRate: [
            {
              doseQuantity: QuantityUnit.tablet.fhirQuantity(input.quantity),
            },
          ],
        },
      ],
    });
  }

  static parse(value: unknown): FhirMedicationRequest {
    return new FhirMedicationRequest(medicationRequestSchema.parse(value));
  }
}
