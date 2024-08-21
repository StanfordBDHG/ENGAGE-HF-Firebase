//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
var QuantityUnit = /** @class */ (function () {
    // Constructor
    function QuantityUnit(code, unit, system) {
        if (system === void 0) { system = 'http://unitsofmeasure.org'; }
        this.unit = unit;
        this.code = code;
        this.system = system;
    }
    // Methods
    QuantityUnit.prototype.isUsedIn = function (other) {
        return (this.code === other.code &&
            this.system === other.system &&
            this.unit === other.unit);
    };
    QuantityUnit.prototype.equals = function (other) {
        return (this.code === other.code &&
            this.system === other.system &&
            this.unit === other.unit);
    };
    QuantityUnit.prototype.convert = function (value, target) {
        var _this = this;
        var _a;
        return (_a = QuantityUnitConverter.allValues
            .find(function (converter) {
            return converter.sourceUnit.equals(_this) &&
                converter.targetUnit.equals(target);
        })) === null || _a === void 0 ? void 0 : _a.convert(value);
    };
    QuantityUnit.prototype.fhirQuantity = function (value) {
        return {
            system: this.system,
            code: this.code,
            value: value,
            unit: this.unit,
        };
    };
    QuantityUnit.prototype.valueOf = function (quantity) {
        var _this = this;
        var _a;
        if (!(quantity === null || quantity === void 0 ? void 0 : quantity.value))
            return undefined;
        if (this.isUsedIn(quantity))
            return quantity.value;
        return (_a = QuantityUnitConverter.allValues
            .find(function (converter) {
            return converter.sourceUnit.isUsedIn(quantity) &&
                converter.targetUnit.equals(_this);
        })) === null || _a === void 0 ? void 0 : _a.convert(quantity.value);
    };
    // Static Properties
    QuantityUnit.mg = new QuantityUnit('mg', 'mg');
    QuantityUnit.lbs = new QuantityUnit('[lb_av]', 'lbs');
    QuantityUnit.kg = new QuantityUnit('kg', 'kg');
    QuantityUnit.bpm = new QuantityUnit('/min', 'beats/minute');
    QuantityUnit.mmHg = new QuantityUnit('mm[Hg]', 'mmHg');
    QuantityUnit.mg_dL = new QuantityUnit('mg/dL', 'mg/dL');
    QuantityUnit.mEq_L = new QuantityUnit('meq/L', 'mEq/L');
    QuantityUnit.mL_min_173m2 = new QuantityUnit('mL/min/{1.73_m2}', 'mL/min/1.73m2');
    QuantityUnit.tablet = new QuantityUnit('{tbl}', 'tbl.');
    QuantityUnit.allValues = [
        QuantityUnit.mg,
        QuantityUnit.lbs,
        QuantityUnit.kg,
        QuantityUnit.bpm,
        QuantityUnit.mmHg,
        QuantityUnit.mg_dL,
        QuantityUnit.mEq_L,
        QuantityUnit.mL_min_173m2,
        QuantityUnit.tablet,
    ];
    return QuantityUnit;
}());
export { QuantityUnit };
var QuantityUnitConverter = /** @class */ (function () {
    function QuantityUnitConverter(sourceUnit, targetUnit, convert) {
        this.sourceUnit = sourceUnit;
        this.targetUnit = targetUnit;
        this.convert = convert;
    }
    QuantityUnitConverter.allValues = [
        new QuantityUnitConverter(QuantityUnit.lbs, QuantityUnit.kg, function (value) { return value * 0.45359237; }),
        new QuantityUnitConverter(QuantityUnit.kg, QuantityUnit.lbs, function (value) { return value / 0.45359237; }),
    ];
    return QuantityUnitConverter;
}());
