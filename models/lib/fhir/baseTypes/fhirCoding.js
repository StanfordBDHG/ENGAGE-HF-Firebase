//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { z } from 'zod';
import { fhirElementConverter } from './fhirElement.js';
import { Lazy } from '../../helpers/lazy.js';
import { optionalish } from '../../helpers/optionalish.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
export var fhirCodingConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: fhirElementConverter.value.schema.extend({
            system: optionalish(z.string()),
            version: optionalish(z.string()),
            code: optionalish(z.string()),
            display: optionalish(z.string()),
            userSelected: optionalish(z.boolean()),
        }),
        encode: function (object) {
            var _a, _b, _c, _d, _e;
            return (__assign(__assign({}, fhirElementConverter.value.encode(object)), { system: (_a = object.system) !== null && _a !== void 0 ? _a : null, version: (_b = object.version) !== null && _b !== void 0 ? _b : null, code: (_c = object.code) !== null && _c !== void 0 ? _c : null, display: (_d = object.display) !== null && _d !== void 0 ? _d : null, userSelected: (_e = object.userSelected) !== null && _e !== void 0 ? _e : null }));
        },
    });
});
