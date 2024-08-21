//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { z } from 'zod';
import { Lazy } from '../../helpers/lazy.js';
import { dateConverter } from '../../helpers/dateConverter.js';
import { optionalish } from '../../helpers/optionalish.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
export var fhirPeriodConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            start: optionalish(dateConverter.schema),
            end: optionalish(dateConverter.schema),
        }),
        encode: function (object) { return ({
            start: object.start ? dateConverter.encode(object.start) : null,
            end: object.end ? dateConverter.encode(object.end) : null,
        }); },
    });
});
