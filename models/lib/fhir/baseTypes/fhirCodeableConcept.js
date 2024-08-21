//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { z } from 'zod';
import { fhirCodingConverter } from './fhirCoding.js';
import { Lazy } from '../../helpers/lazy.js';
import { optionalish } from '../../helpers/optionalish.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
export var fhirCodeableConceptConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            coding: optionalish(z.lazy(function () { return fhirCodingConverter.value.schema; }).array()),
            text: optionalish(z.string()),
        }),
        encode: function (object) {
            var _a;
            return ({
                coding: object.coding ?
                    object.coding.map(fhirCodingConverter.value.encode)
                    : null,
                text: (_a = object.text) !== null && _a !== void 0 ? _a : null,
            });
        },
    });
});
