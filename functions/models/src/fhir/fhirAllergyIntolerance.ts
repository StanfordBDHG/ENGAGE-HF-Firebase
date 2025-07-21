//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { CodingSystem } from '../codes/codes.js'
import { type MedicationReference } from '../codes/references.js'
import { Lazy } from '../helpers/lazy.js'
import { optionalish } from '../helpers/optionalish.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'
import { AllergyIntolerance } from 'fhir/r4b.js'
import { FHIRResource } from './fhirResource.js'
import {
  AllergyIntoleranceCriticality,
  AllergyIntoleranceType,
} from 'spezi-firebase-fhir'

/*
export const fhirAllergyIntoleranceConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: fhirResourceConverter.value.schema
        .extend({
          type: z.nativeEnum(FHIRAllergyIntoleranceType),
          criticality: optionalish(
            z.nativeEnum(FHIRAllergyIntoleranceCriticality),
          ),
          code: optionalish(
            z.lazy(() => fhirCodeableConceptConverter.value.schema),
          ),
        })
        .transform((values) => new FHIRAllergyIntolerance(values)),
      encode: (object) => ({
        ...fhirResourceConverter.value.encode(object),
        type: object.type,
        criticality: object.criticality ?? null,
        code:
          object.code ?
            fhirCodeableConceptConverter.value.encode(object.code)
          : null,
      }),
    }),
)
    */

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
