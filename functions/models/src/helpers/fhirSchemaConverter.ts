//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type DomainResource } from 'fhir/r4b.js'
import { type ZodType } from 'zod'
import { type FHIRResource } from '../fhir/fhirResource.js'

export class FHIRSchemaConverter<
  FHIRResourceType extends FHIRResource<DomainResource>,
> {
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
    return this.schema.parse(removeNulls(input))
  }

  encode(input: FHIRResourceType): unknown {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */ /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
    const returnValue = input.data as any

    for (const key of this.nullProperties) {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */ /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
      returnValue[key] = returnValue[key] ?? null
    }

    return returnValue
  }
}

function removeNulls(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(removeNulls).filter((v) => v !== null)
  } else if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== null)
        .map(([k, v]) => [k, removeNulls(v)]),
    )
  } else {
    return value
  }
}
