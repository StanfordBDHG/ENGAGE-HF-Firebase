//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { CodingSystem } from '../codes/codes.js'
import { type MedicationReference } from '../codes/references.js'
import { AllergyIntolerance } from 'fhir/r4b.js'
import { FHIRResource } from './fhirResource.js'
import {
  AllergyIntoleranceCriticality,
  allergyIntoleranceSchema,
  AllergyIntoleranceType,
} from 'spezi-firebase-fhir'
import { FHIRSchemaConverter } from '../helpers/fhirSchemaConverter.js'
import { ZodType } from 'zod/v4'

export class FHIRAllergyIntolerance extends FHIRResource<AllergyIntolerance> {
  // Static Functions

  static create(input: {
    type: AllergyIntoleranceType
    criticality?: AllergyIntoleranceCriticality
    reference: MedicationReference
    userId: string
  }): FHIRAllergyIntolerance {
    return new FHIRAllergyIntolerance({
      resourceType: 'AllergyIntolerance',
      patient: {
        reference: `users/${input.userId}`,
      },
      type: input.type,
      criticality: input.criticality,
      code: {
        coding: [
          {
            system: CodingSystem.rxNorm,
            code: input.reference.split('/')[1],
          },
        ],
      },
    })
  }

  // Computed Properties

  get rxNormCodes(): string[] {
    return this.codes(this.data.code, { system: CodingSystem.rxNorm })
  }
}

const schema: ZodType<AllergyIntolerance> = allergyIntoleranceSchema
/*
export const allergyIntoleranceConverter =
  new FHIRSchemaConverter<FHIRAllergyIntolerance>({
    schema: allergyIntoleranceSchema.transform(
      (data) => new FHIRAllergyIntolerance(data),
    ),
    nullProperties: [],
  })
    */
