//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { fhirElementConverter } from './fhirElement.js'
import { Lazy } from '../../../services/factory/lazy.js'
import { optionalish } from '../../helpers/optionalish.js'
import { SchemaConverter } from '../../helpers/schemaConverter.js'

export const fhirCodingConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: fhirElementConverter.value.schema.extend({
        system: optionalish(z.string()),
        version: optionalish(z.string()),
        code: optionalish(z.string()),
        display: optionalish(z.string()),
        userSelected: optionalish(z.boolean()),
      }),
      encode: (object) => ({
        ...fhirElementConverter.value.encode(object),
        system: object.system,
        version: object.version,
        code: object.code,
        display: object.display,
        userSelected: object.userSelected,
      }),
    }),
)

export type FHIRCoding = z.output<typeof fhirCodingConverter.value.schema>
