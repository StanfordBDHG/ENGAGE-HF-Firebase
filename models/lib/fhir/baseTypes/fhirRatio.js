//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { z } from 'zod';
import { fhirQuantityConverter } from './fhirQuantity.js';
import { Lazy } from '../../helpers/lazy.js';
import { optionalish } from '../../helpers/optionalish.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
export var fhirRatioConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            numerator: optionalish(z.lazy(function () { return fhirQuantityConverter.value.schema; })),
            denominator: optionalish(z.lazy(function () { return fhirQuantityConverter.value.schema; })),
        }),
        encode: function (object) { return ({
            numerator: object.numerator ?
                fhirQuantityConverter.value.encode(object.numerator)
                : null,
            denominator: object.denominator ?
                fhirQuantityConverter.value.encode(object.denominator)
                : null,
        }); },
    });
});
