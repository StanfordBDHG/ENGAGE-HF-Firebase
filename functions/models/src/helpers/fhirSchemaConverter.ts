//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { ZodType } from 'zod/v4'
import { FHIRResource } from '../fhir/fhirResource.js'

export class FHIRSchemaConverter<FHIRResourceType extends FHIRResource> {
  // Properties

  readonly schema: ZodType<FHIRResourceType>
  readonly nullProperties: string[]

  // Constructor

  constructor(
    schema: ZodType<FHIRResourceType>,
    options: {
      nullProperties: string[]
    },
  ) {
    this.schema = schema
    this.nullProperties = options.nullProperties
  }

  // Methods

  decode(input: unknown) {
    return this.schema.parse(this.removeNulls(input))
  }

  encode(input: FHIRResourceType): unknown {
    const returnValue = input.data as any

    for (const key of this.nullProperties) {
      returnValue[key] = returnValue[key] ?? null
    }

    return returnValue
  }

  // Helpers

  private removeNulls(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map(this.removeNulls).filter((v) => v !== null)
    } else if (value !== null && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value)
          .filter(([, v]) => v !== null)
          .map(([k, v]) => [k, this.removeNulls(v)]),
      )
    } else {
      return value
    }
  }
}
