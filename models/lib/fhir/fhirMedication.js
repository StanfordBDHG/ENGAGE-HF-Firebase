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
import { fhirRatioConverter } from './baseTypes/fhirRatio.js';
import { CodingSystem, FHIRExtensionUrl } from '../codes/codes.js';
import { Lazy } from '../helpers/lazy.js';
import { QuantityUnit } from '../codes/quantityUnit.js';
import { optionalish } from '../helpers/optionalish.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var fhirMedicationIngredientConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            strength: optionalish(z.lazy(function () { return fhirRatioConverter.value.schema; })),
            itemCodeableConcept: optionalish(z.lazy(function () { return fhirCodeableConceptConverter.value.schema; })),
        }),
        encode: function (object) { return ({
            strength: object.strength ?
                fhirRatioConverter.value.encode(object.strength)
                : null,
            itemCodeableConcept: object.itemCodeableConcept ?
                fhirCodeableConceptConverter.value.encode(object.itemCodeableConcept)
                : null,
        }); },
    });
});
export var fhirMedicationConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: fhirResourceConverter.value.schema
            .extend({
            code: optionalish(z.lazy(function () { return fhirCodeableConceptConverter.value.schema; })),
            form: optionalish(z.lazy(function () { return fhirCodeableConceptConverter.value.schema; })),
            ingredient: optionalish(z
                .lazy(function () { return fhirMedicationIngredientConverter.value.schema; })
                .array()),
        })
            .transform(function (values) { return new FHIRMedication(values); }),
        encode: function (object) {
            var _a, _b;
            return (__assign(__assign({}, fhirResourceConverter.value.encode(object)), { code: object.code ?
                    fhirCodeableConceptConverter.value.encode(object.code)
                    : null, form: object.form ?
                    fhirCodeableConceptConverter.value.encode(object.form)
                    : null, ingredient: (_b = (_a = object.ingredient) === null || _a === void 0 ? void 0 : _a.map(fhirMedicationIngredientConverter.value.encode)) !== null && _b !== void 0 ? _b : null }));
        },
    });
});
var FHIRMedication = /** @class */ (function (_super) {
    __extends(FHIRMedication, _super);
    // Constructor
    function FHIRMedication(input) {
        var _this = _super.call(this, input) || this;
        // Stored Properties
        _this.resourceType = 'Medication';
        _this.code = input.code;
        _this.ingredient = input.ingredient;
        _this.form = input.form;
        return _this;
    }
    Object.defineProperty(FHIRMedication.prototype, "displayName", {
        // Computed Properties
        get: function () {
            var _a, _b, _c, _d, _e;
            return ((_b = (_a = this.code) === null || _a === void 0 ? void 0 : _a.text) !== null && _b !== void 0 ? _b : (_e = (_d = (_c = this.code) === null || _c === void 0 ? void 0 : _c.coding) === null || _d === void 0 ? void 0 : _d.find(function (coding) { return coding.system === CodingSystem.rxNorm; })) === null || _e === void 0 ? void 0 : _e.display);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FHIRMedication.prototype, "medicationClassReference", {
        get: function () {
            var _a;
            return (_a = this.extensionsWithUrl(FHIRExtensionUrl.medicationClass).at(0)) === null || _a === void 0 ? void 0 : _a.valueReference;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FHIRMedication.prototype, "minimumDailyDoseRequest", {
        get: function () {
            var _a;
            return (_a = this.extensionsWithUrl(FHIRExtensionUrl.minimumDailyDose).at(0)) === null || _a === void 0 ? void 0 : _a.valueMedicationRequest;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FHIRMedication.prototype, "minimumDailyDose", {
        get: function () {
            var _a, _b;
            var request = this.minimumDailyDoseRequest;
            if (!request)
                return undefined;
            return (_b = (_a = this.extensionsWithUrl(FHIRExtensionUrl.totalDailyDose)
                .at(0)) === null || _a === void 0 ? void 0 : _a.valueQuantities) === null || _b === void 0 ? void 0 : _b.flatMap(function (quantity) {
                var value = QuantityUnit.mg.valueOf(quantity);
                return value ? [value] : [];
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FHIRMedication.prototype, "targetDailyDoseRequest", {
        get: function () {
            var _a;
            return (_a = this.extensionsWithUrl(FHIRExtensionUrl.targetDailyDose).at(0)) === null || _a === void 0 ? void 0 : _a.valueMedicationRequest;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FHIRMedication.prototype, "targetDailyDose", {
        get: function () {
            var _a, _b;
            var request = this.targetDailyDoseRequest;
            if (!request)
                return undefined;
            var result = (_b = (_a = request
                .extensionsWithUrl(FHIRExtensionUrl.totalDailyDose)
                .at(0)) === null || _a === void 0 ? void 0 : _a.valueQuantities) === null || _b === void 0 ? void 0 : _b.flatMap(function (quantity) {
                var value = QuantityUnit.mg.valueOf(quantity);
                return value ? [value] : [];
            });
            return result;
        },
        enumerable: false,
        configurable: true
    });
    return FHIRMedication;
}(FHIRResource));
export { FHIRMedication };
