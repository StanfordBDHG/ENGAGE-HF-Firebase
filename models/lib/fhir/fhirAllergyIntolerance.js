//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import { fhirCodeableConceptConverter, } from './baseTypes/fhirCodeableConcept.js';
import { FHIRResource, fhirResourceConverter, } from './baseTypes/fhirElement.js';
import { CodingSystem } from '../codes/codes.js';
import { Lazy } from '../helpers/lazy.js';
import { optionalish } from '../helpers/optionalish.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var FHIRAllergyIntoleranceType;
(function (FHIRAllergyIntoleranceType) {
    FHIRAllergyIntoleranceType["allergy"] = "allergy";
    FHIRAllergyIntoleranceType["intolerance"] = "intolerance";
    FHIRAllergyIntoleranceType["financial"] = "financial";
    FHIRAllergyIntoleranceType["preference"] = "preference";
})(FHIRAllergyIntoleranceType || (FHIRAllergyIntoleranceType = {}));
export var FHIRAllergyIntoleranceCriticality;
(function (FHIRAllergyIntoleranceCriticality) {
    FHIRAllergyIntoleranceCriticality["low"] = "low";
    FHIRAllergyIntoleranceCriticality["high"] = "high";
    FHIRAllergyIntoleranceCriticality["unableToAssess"] = "unable-to-assess";
})(FHIRAllergyIntoleranceCriticality || (FHIRAllergyIntoleranceCriticality = {}));
export var fhirAllergyIntoleranceConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: fhirResourceConverter.value.schema
            .extend({
            type: z.nativeEnum(FHIRAllergyIntoleranceType),
            criticality: optionalish(z.nativeEnum(FHIRAllergyIntoleranceCriticality)),
            code: optionalish(z.lazy(function () { return fhirCodeableConceptConverter.value.schema; })),
        })
            .transform(function (values) { return new FHIRAllergyIntolerance(values); }),
        encode: function (object) {
            var _a;
            return (__assign(__assign({}, fhirResourceConverter.value.encode(object)), { type: object.type, criticality: (_a = object.criticality) !== null && _a !== void 0 ? _a : null, code: object.code ?
                    fhirCodeableConceptConverter.value.encode(object.code)
                    : null }));
        },
    });
});
var FHIRAllergyIntolerance = /** @class */ (function (_super) {
    __extends(FHIRAllergyIntolerance, _super);
    // Constructor
    function FHIRAllergyIntolerance(input) {
        var _this = _super.call(this, input) || this;
        // Stored Properties
        _this.resourceType = 'AllergyIntolerance';
        _this.type = input.type;
        _this.criticality = input.criticality;
        _this.code = input.code;
        return _this;
    }
    // Static Functions
    FHIRAllergyIntolerance.create = function (input) {
        return new FHIRAllergyIntolerance({
            type: input.type,
            criticality: input.criticality,
            code: {
                coding: [
                    {
                        system: CodingSystem.rxNorm,
                        code: input.reference.split('/')[1],
                    },
                ],
            },
        });
    };
    Object.defineProperty(FHIRAllergyIntolerance.prototype, "rxNormCodes", {
        // Computed Properties
        get: function () {
            return this.codes(this.code, { system: CodingSystem.rxNorm });
        },
        enumerable: false,
        configurable: true
    });
    return FHIRAllergyIntolerance;
}(FHIRResource));
export { FHIRAllergyIntolerance };
