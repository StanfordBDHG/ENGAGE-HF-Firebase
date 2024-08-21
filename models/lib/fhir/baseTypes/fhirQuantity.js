//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { z } from 'zod';
import { Lazy } from '../../helpers/lazy.js';
import { optionalish } from '../../helpers/optionalish.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
export var fhirQuantityConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            code: optionalish(z.string()),
            system: optionalish(z.string()),
            unit: optionalish(z.string()),
            value: optionalish(z.number()),
        }),
        encode: function (object) {
            var _a, _b, _c, _d;
            return ({
                code: (_a = object.code) !== null && _a !== void 0 ? _a : null,
                system: (_b = object.system) !== null && _b !== void 0 ? _b : null,
                unit: (_c = object.unit) !== null && _c !== void 0 ? _c : null,
                value: (_d = object.value) !== null && _d !== void 0 ? _d : null,
            });
        },
    });
});
