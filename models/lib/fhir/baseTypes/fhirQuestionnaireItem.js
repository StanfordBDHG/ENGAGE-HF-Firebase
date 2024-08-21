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
import { fhirCodingConverter } from './fhirCoding.js';
import { Lazy } from '../../helpers/lazy.js';
import { optionalish } from '../../helpers/optionalish.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
export var FHIRQuestionnaireItemType;
(function (FHIRQuestionnaireItemType) {
    FHIRQuestionnaireItemType["group"] = "group";
    FHIRQuestionnaireItemType["display"] = "display";
    FHIRQuestionnaireItemType["choice"] = "choice";
})(FHIRQuestionnaireItemType || (FHIRQuestionnaireItemType = {}));
var fhirQuestionnaireItemBaseConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            linkId: optionalish(z.string()),
            type: optionalish(z.nativeEnum(FHIRQuestionnaireItemType)),
            text: optionalish(z.string()),
            required: optionalish(z.boolean()),
            answerOption: optionalish(z
                .object({
                valueCoding: optionalish(z.lazy(function () { return fhirCodingConverter.value.schema; })),
            })
                .array()),
        }),
        encode: function (object) {
            var _a, _b, _c, _d, _e, _f;
            return ({
                linkId: (_a = object.linkId) !== null && _a !== void 0 ? _a : null,
                type: (_b = object.type) !== null && _b !== void 0 ? _b : null,
                text: (_c = object.text) !== null && _c !== void 0 ? _c : null,
                required: (_d = object.required) !== null && _d !== void 0 ? _d : null,
                answerOption: (_f = (_e = object.answerOption) === null || _e === void 0 ? void 0 : _e.map(function (option) { return ({
                    valueCoding: option.valueCoding ?
                        fhirCodingConverter.value.encode(option.valueCoding)
                        : null,
                }); })) !== null && _f !== void 0 ? _f : null,
            });
        },
    });
});
export var fhirQuestionnaireItemConverter = new Lazy(function () {
    var fhirQuestionnaireItemSchema = fhirQuestionnaireItemBaseConverter.value.schema.extend({
        item: optionalish(z.lazy(function () { return fhirQuestionnaireItemSchema.array(); })),
    });
    function fhirQuestionnaireItemEncode(object) {
        return __assign(__assign({}, fhirQuestionnaireItemBaseConverter.value.encode(object)), { item: object.item ? object.item.map(fhirQuestionnaireItemEncode) : null });
    }
    return new SchemaConverter({
        schema: fhirQuestionnaireItemSchema,
        encode: fhirQuestionnaireItemEncode,
    });
});
