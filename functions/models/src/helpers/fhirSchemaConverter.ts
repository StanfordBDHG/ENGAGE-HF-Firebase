//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type FhirDomainResource } from "@stanfordspezi/spezi-firebase-fhir";
import { type DomainResource } from "fhir/r4b.js";

export type GenericFhirSchemaConverter = FhirSchemaConverter<
  FhirDomainResource<DomainResource>
>;

export class FhirSchemaConverter<
  ResourceType extends FhirDomainResource<DomainResource>,
> {
  // Properties

  readonly _decode: (value: unknown) => ResourceType;
  readonly nullProperties: string[];

  // Constructor

  constructor(
    decode: (value: unknown) => ResourceType,
    options: {
      nullProperties: string[];
    },
  ) {
    this._decode = decode;
    this.nullProperties = options.nullProperties;
  }

  // Methods

  decode(input: unknown) {
    return this._decode(removeNullOrUndefinedValues(input));
  }

  encode(input: ResourceType): unknown {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */ /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
    const returnValue = removeNullOrUndefinedValues(input.value) as any;

    for (const key of this.nullProperties) {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */ /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
      returnValue[key] = returnValue[key] ?? null;
    }

    return returnValue;
  }
}

const removeNullOrUndefinedValues = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value
      .map(removeNullOrUndefinedValues)
      .filter((v) => v !== null && v !== undefined);
  } else if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => [k, removeNullOrUndefinedValues(v)]),
    );
  } else {
    return value;
  }
};
