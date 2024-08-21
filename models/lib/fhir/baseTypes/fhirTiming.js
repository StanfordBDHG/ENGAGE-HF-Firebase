//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { z } from 'zod';
import { fhirCodeableConceptConverter } from './fhirCodeableConcept.js';
import { Lazy } from '../../helpers/lazy.js';
import { optionalish } from '../../helpers/optionalish.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
export var fhirTimingRepeatConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            frequency: optionalish(z.number()),
            period: optionalish(z.number()),
            periodUnit: optionalish(z.string()),
            timeOfDay: optionalish(z.string().array()),
        }),
        encode: function (object) {
            var _a, _b, _c, _d;
            return ({
                frequency: (_a = object.frequency) !== null && _a !== void 0 ? _a : null,
                period: (_b = object.period) !== null && _b !== void 0 ? _b : null,
                periodUnit: (_c = object.periodUnit) !== null && _c !== void 0 ? _c : null,
                timeOfDay: (_d = object.timeOfDay) !== null && _d !== void 0 ? _d : null,
            });
        },
    });
});
export var fhirTimingConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            repeat: optionalish(z.lazy(function () { return fhirTimingRepeatConverter.value.schema; })),
            code: optionalish(z.lazy(function () { return fhirCodeableConceptConverter.value.schema; })),
        }),
        encode: function (object) { return ({
            repeat: object.repeat ?
                fhirTimingRepeatConverter.value.encode(object.repeat)
                : null,
            code: object.code ?
                fhirCodeableConceptConverter.value.encode(object.code)
                : null,
        }); },
    });
});
