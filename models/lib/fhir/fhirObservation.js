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
import { fhirPeriodConverter } from './baseTypes/fhirPeriod.js';
import { fhirQuantityConverter, } from './baseTypes/fhirQuantity.js';
import { CodingSystem, LoincCode } from '../codes/codes.js';
import { Lazy } from '../helpers/lazy.js';
import { QuantityUnit } from '../codes/quantityUnit.js';
import { dateConverter } from '../helpers/dateConverter.js';
import { optionalish } from '../helpers/optionalish.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var FHIRObservationStatus;
(function (FHIRObservationStatus) {
    FHIRObservationStatus["registered"] = "registered";
    FHIRObservationStatus["preliminary"] = "preliminary";
    FHIRObservationStatus["final"] = "final";
    FHIRObservationStatus["amended"] = "amended";
    FHIRObservationStatus["corrected"] = "corrected";
    FHIRObservationStatus["cancelled"] = "cancelled";
    FHIRObservationStatus["entered_in_error"] = "entered-in-error";
    FHIRObservationStatus["unknown"] = "unknown";
})(FHIRObservationStatus || (FHIRObservationStatus = {}));
export var fhirObservationComponentConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            code: z.lazy(function () { return fhirCodeableConceptConverter.value.schema; }),
            valueQuantity: optionalish(z.lazy(function () { return fhirQuantityConverter.value.schema; })),
        }),
        encode: function (object) { return ({
            code: fhirCodeableConceptConverter.value.encode(object.code),
            valueQuantity: object.valueQuantity ?
                fhirQuantityConverter.value.encode(object.valueQuantity)
                : null,
        }); },
    });
});
export var fhirObservationConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: fhirResourceConverter.value.schema
            .extend({
            status: z.nativeEnum(FHIRObservationStatus),
            code: z.lazy(function () { return fhirCodeableConceptConverter.value.schema; }),
            component: optionalish(z
                .lazy(function () { return fhirObservationComponentConverter.value.schema; })
                .array()),
            valueQuantity: optionalish(z.lazy(function () { return fhirQuantityConverter.value.schema; })),
            effectivePeriod: optionalish(z.lazy(function () { return fhirPeriodConverter.value.schema; })),
            effectiveDateTime: optionalish(dateConverter.schema),
            effectiveInstant: optionalish(dateConverter.schema),
        })
            .transform(function (values) { return new FHIRObservation(values); }),
        encode: function (object) {
            var _a, _b;
            return (__assign(__assign({}, fhirResourceConverter.value.encode(object)), { status: object.status, code: fhirCodeableConceptConverter.value.encode(object.code), component: (_b = (_a = object.component) === null || _a === void 0 ? void 0 : _a.map(fhirObservationComponentConverter.value.encode)) !== null && _b !== void 0 ? _b : null, valueQuantity: object.valueQuantity ?
                    fhirQuantityConverter.value.encode(object.valueQuantity)
                    : null, effectivePeriod: object.effectivePeriod ?
                    fhirPeriodConverter.value.encode(object.effectivePeriod)
                    : null, effectiveDateTime: object.effectiveDateTime ?
                    dateConverter.encode(object.effectiveDateTime)
                    : null, effectiveInstant: object.effectiveInstant ?
                    dateConverter.encode(object.effectiveInstant)
                    : null }));
        },
    });
});
var FHIRObservation = /** @class */ (function (_super) {
    __extends(FHIRObservation, _super);
    // Constructor
    function FHIRObservation(input) {
        var _this = _super.call(this, input) || this;
        // Properties
        _this.resourceType = 'Observation';
        _this.status = input.status;
        _this.code = input.code;
        _this.component = input.component;
        _this.valueQuantity = input.valueQuantity;
        _this.effectivePeriod = input.effectivePeriod;
        _this.effectiveDateTime = input.effectiveDateTime;
        _this.effectiveInstant = input.effectiveInstant;
        return _this;
    }
    FHIRObservation.createBloodPressure = function (input) {
        return new FHIRObservation({
            id: input.id,
            status: FHIRObservationStatus.final,
            code: {
                text: this.loincDisplay.get(LoincCode.bloodPressure),
                coding: [
                    {
                        system: CodingSystem.loinc,
                        code: LoincCode.bloodPressure,
                        display: this.loincDisplay.get(LoincCode.bloodPressure),
                    },
                ],
            },
            component: [
                {
                    code: {
                        text: this.loincDisplay.get(LoincCode.systolicBloodPressure),
                        coding: [
                            {
                                system: CodingSystem.loinc,
                                code: LoincCode.systolicBloodPressure,
                                display: this.loincDisplay.get(LoincCode.systolicBloodPressure),
                            },
                        ],
                    },
                    valueQuantity: {
                        value: input.systolic,
                        unit: QuantityUnit.mmHg.unit,
                        system: QuantityUnit.mmHg.system,
                        code: QuantityUnit.mmHg.code,
                    },
                },
                {
                    code: {
                        text: this.loincDisplay.get(LoincCode.diastolicBloodPressure),
                        coding: [
                            {
                                system: CodingSystem.loinc,
                                code: LoincCode.diastolicBloodPressure,
                                display: this.loincDisplay.get(LoincCode.diastolicBloodPressure),
                            },
                        ],
                    },
                    valueQuantity: {
                        value: input.diastolic,
                        unit: QuantityUnit.mmHg.unit,
                        system: QuantityUnit.mmHg.system,
                        code: QuantityUnit.mmHg.code,
                    },
                },
            ],
            effectiveDateTime: input.date,
        });
    };
    FHIRObservation.createSimple = function (input) {
        var _a, _b;
        return new FHIRObservation({
            id: input.id,
            status: FHIRObservationStatus.final,
            code: {
                text: (_a = this.loincDisplay.get(input.code)) !== null && _a !== void 0 ? _a : undefined,
                coding: [
                    {
                        system: CodingSystem.loinc,
                        code: input.code,
                        display: (_b = this.loincDisplay.get(input.code)) !== null && _b !== void 0 ? _b : undefined,
                    },
                ],
            },
            valueQuantity: {
                value: input.value,
                unit: input.unit.unit,
                system: input.unit.system,
                code: input.unit.code,
            },
            effectiveDateTime: input.date,
        });
    };
    // Methods
    FHIRObservation.prototype.observations = function (options) {
        var _a, _b, _c, _d, _e, _f;
        var result = [];
        if (!this.containsCoding(this.code, [options]))
            return result;
        var date = (_d = (_b = (_a = this.effectiveDateTime) !== null && _a !== void 0 ? _a : this.effectiveInstant) !== null && _b !== void 0 ? _b : (_c = this.effectivePeriod) === null || _c === void 0 ? void 0 : _c.start) !== null && _d !== void 0 ? _d : (_e = this.effectivePeriod) === null || _e === void 0 ? void 0 : _e.end;
        if (!date)
            return result;
        if (options.component) {
            for (var _i = 0, _g = (_f = this.component) !== null && _f !== void 0 ? _f : []; _i < _g.length; _i++) {
                var component = _g[_i];
                if (!this.containsCoding(component.code, [options.component]))
                    continue;
                var value = options.unit.valueOf(component.valueQuantity);
                if (!value)
                    continue;
                result.push({
                    date: date,
                    value: value,
                    unit: options.unit,
                });
            }
        }
        else {
            var value = options.unit.valueOf(this.valueQuantity);
            if (!value)
                return result;
            result.push({ date: date, value: value, unit: options.unit });
        }
        return result;
    };
    // Static Functions
    FHIRObservation.loincDisplay = new Map([
        [
            LoincCode.bloodPressure,
            'Blood pressure panel with all children optional',
        ],
        [LoincCode.systolicBloodPressure, 'Systolic blood pressure'],
        [LoincCode.diastolicBloodPressure, 'Diastolic blood pressure'],
        [LoincCode.bodyWeight, 'Body weight'],
        [LoincCode.creatinine, 'Creatinine [Mass/volume] in Serum or Plasma'],
        [
            LoincCode.estimatedGlomerularFiltrationRate,
            'Glomerular filtration rate/1.73 sq M.predicted [Volume Rate/Area] in Serum, Plasma or Blood by Creatinine-based formula (CKD-EPI 2021)',
        ],
        [LoincCode.heartRate, 'Heart rate'],
        [LoincCode.potassium, 'Potassium [Moles/volume] in Blood'],
    ]);
    return FHIRObservation;
}(FHIRResource));
export { FHIRObservation };
