//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from "zod";
import { dateTimeConverter } from "../../helpers/dateConverter.js";
import { Lazy } from "../../helpers/lazy.js";
import { optionalish } from "../../helpers/optionalish.js";
import { SchemaConverter } from "../../helpers/schemaConverter.js";

export const fhirPeriodConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: z.object({
        start: optionalish(dateTimeConverter.schema),
        end: optionalish(dateTimeConverter.schema),
      }),
      encode: (object) => ({
        start: object.start ? dateTimeConverter.encode(object.start) : null,
        end: object.end ? dateTimeConverter.encode(object.end) : null,
      }),
    }),
);

export type FHIRPeriod = z.output<typeof fhirPeriodConverter.value.schema>;
