//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { z } from 'zod';
import { fhirCodeableConceptConverter } from './fhirCodeableConcept.js';
import { fhirQuantityConverter } from './fhirQuantity.js';
import { fhirTimingConverter } from './fhirTiming.js';
import { Lazy } from '../../helpers/lazy.js';
import { optionalish } from '../../helpers/optionalish.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
var fhirDosageDoseAndRateConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            type: optionalish(z.lazy(function () { return fhirCodeableConceptConverter.value.schema; })),
            doseQuantity: optionalish(z.lazy(function () { return fhirQuantityConverter.value.schema; })),
        }),
        encode: function (object) { return ({
            type: object.type ?
                fhirCodeableConceptConverter.value.encode(object.type)
                : null,
            doseQuantity: object.doseQuantity ?
                fhirQuantityConverter.value.encode(object.doseQuantity)
                : null,
        }); },
    });
});
export var fhirDosageConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            text: optionalish(z.string()),
            patientInstruction: optionalish(z.string()),
            timing: optionalish(z.lazy(function () { return fhirTimingConverter.value.schema; })),
            doseAndRate: optionalish(z.lazy(function () { return fhirDosageDoseAndRateConverter.value.schema; }).array()),
        }),
        encode: function (object) {
            var _a, _b, _c, _d;
            return ({
                text: (_a = object.text) !== null && _a !== void 0 ? _a : null,
                patientInstruction: (_b = object.patientInstruction) !== null && _b !== void 0 ? _b : null,
                timing: object.timing ?
                    fhirTimingConverter.value.encode(object.timing)
                    : null,
                doseAndRate: (_d = (_c = object.doseAndRate) === null || _c === void 0 ? void 0 : _c.map(fhirDosageDoseAndRateConverter.value.encode)) !== null && _d !== void 0 ? _d : null,
            });
        },
    });
});
