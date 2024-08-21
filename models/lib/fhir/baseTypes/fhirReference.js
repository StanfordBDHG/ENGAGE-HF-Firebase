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
export var fhirReferenceConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            reference: z.string(),
            type: optionalish(z.string()),
            display: optionalish(z.string()),
            identifier: optionalish(z.string()),
        }),
        encode: function (object) {
            var _a, _b, _c;
            return ({
                reference: object.reference,
                type: (_a = object.type) !== null && _a !== void 0 ? _a : null,
                display: (_b = object.display) !== null && _b !== void 0 ? _b : null,
                identifier: (_c = object.identifier) !== null && _c !== void 0 ? _c : null,
            });
        },
    });
});
