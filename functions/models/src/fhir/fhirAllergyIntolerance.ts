//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  FhirAllergyIntolerance as BaseFhirAllergyIntolerance,
  allergyIntoleranceSchema,
} from "@stanfordspezi/spezi-firebase-fhir";
import { type AllergyIntolerance } from "fhir/r4b.js";
import { CodingSystem } from "../codes/codes.js";
import { type MedicationReference } from "../codes/references.js";

export class FhirAllergyIntolerance extends BaseFhirAllergyIntolerance {
  // Static Properties

  static readonly schema = allergyIntoleranceSchema.transform(
    (value) => new FhirAllergyIntolerance(value),
  );

  // Static Functions

  static create(input: {
    type?: AllergyIntolerance["type"];
    criticality?: AllergyIntolerance["criticality"];
    reference: MedicationReference;
    userId?: string;
  }): FhirAllergyIntolerance {
    return new FhirAllergyIntolerance({
      resourceType: "AllergyIntolerance",
      patient: {
        reference: input.userId ? `users/${input.userId}` : undefined,
      },
      type: input.type,
      criticality: input.criticality,
      code: {
        coding: [
          {
            system: CodingSystem.rxNorm,
            code: input.reference.split("/")[1],
          },
        ],
      },
    });
  }

  static parse(value: unknown): FhirAllergyIntolerance {
    return new FhirAllergyIntolerance(allergyIntoleranceSchema.parse(value));
  }

  // Computed Properties

  get rxNormCodes(): string[] {
    return this.codes(this.value.code, { system: CodingSystem.rxNorm });
  }
}
