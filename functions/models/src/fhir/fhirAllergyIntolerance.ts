//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type AllergyIntolerance } from "fhir/r4b.js";
import { FHIRResource } from "./fhirResource.js";
import { CodingSystem } from "../codes/codes.js";
import { type MedicationReference } from "../codes/references.js";

export class FHIRAllergyIntolerance extends FHIRResource<AllergyIntolerance> {
  // Static Functions

  static create(input: {
    type?: AllergyIntolerance["type"];
    criticality?: AllergyIntolerance["criticality"];
    reference: MedicationReference;
    userId?: string;
  }): FHIRAllergyIntolerance {
    return new FHIRAllergyIntolerance({
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

  // Computed Properties

  get rxNormCodes(): string[] {
    return this.codes(this.data.code, { system: CodingSystem.rxNorm });
  }
}
