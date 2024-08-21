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
import { fhirDosageConverter } from './fhirDosage.js';
import { fhirQuantityConverter } from './fhirQuantity.js';
import { fhirReferenceConverter } from './fhirReference.js';
import { QuantityUnit } from '../../codes/quantityUnit.js';
import { optionalish } from '../../helpers/optionalish.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
var fhirExtensionBaseConverter = new SchemaConverter({
    schema: z.object({
        url: z.string(),
        valueQuantities: optionalish(z.lazy(function () { return fhirQuantityConverter.value.schema; }).array()),
        valueReference: optionalish(z.lazy(function () { return fhirReferenceConverter.value.schema; })),
    }),
    encode: function (object) { return ({
        url: object.url,
        valueQuantities: object.valueQuantities ?
            object.valueQuantities.map(fhirQuantityConverter.value.encode)
            : null,
        valueReference: object.valueReference ?
            fhirReferenceConverter.value.encode(object.valueReference)
            : null,
    }); },
});
export var fhirExtensionConverter = (function () {
    var fhirExtensionSchema = fhirExtensionBaseConverter.value.schema.extend({
        valueMedicationRequest: optionalish(z.lazy(function () { return fhirMedicationRequestConverter.value.schema; })),
    });
    function fhirExtensionEncode(object) {
        return __assign(__assign({}, fhirExtensionBaseConverter.value.encode(object)), { valueMedicationRequest: object.valueMedicationRequest ?
                fhirMedicationRequestConverter.value.encode(object.valueMedicationRequest)
                : null });
    }
    return new SchemaConverter({
        schema: fhirExtensionSchema,
        encode: fhirExtensionEncode,
    });
})();
export var fhirElementConverter = new SchemaConverter({
    schema: z.object({
        id: optionalish(z.string()),
        extension: optionalish(z.lazy(function () { return fhirExtensionConverter.value.schema; }).array()),
    }),
    encode: function (object) {
        var _a, _b, _c;
        return ({
            id: (_a = object.id) !== null && _a !== void 0 ? _a : null,
            extension: (_c = (_b = object.extension) === null || _b === void 0 ? void 0 : _b.map(fhirExtensionConverter.value.encode)) !== null && _c !== void 0 ? _c : null,
        });
    },
});
var FHIRElement = /** @class */ (function () {
    // Constructor
    function FHIRElement(input) {
        this.id = input.id;
        this.extension = input.extension;
    }
    // Methods
    FHIRElement.prototype.extensionsWithUrl = function (url) {
        var _a, _b;
        return ((_b = (_a = this.extension) === null || _a === void 0 ? void 0 : _a.filter(function (extension) { return extension.url === url.toString(); })) !== null && _b !== void 0 ? _b : []);
    };
    return FHIRElement;
}());
export { FHIRElement };
export var fhirResourceConverter = new SchemaConverter({
    schema: fhirElementConverter.value.schema.extend({
        resourceType: z.string(),
    }),
    encode: function (object) { return (__assign(__assign({}, fhirElementConverter.value.encode(object)), { resourceType: object.resourceType })); },
});
var FHIRResource = /** @class */ (function (_super) {
    __extends(FHIRResource, _super);
    function FHIRResource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Methods
    FHIRResource.prototype.codes = function (concept, filter) {
        var _a, _b;
        return ((_b = (_a = concept === null || concept === void 0 ? void 0 : concept.coding) === null || _a === void 0 ? void 0 : _a.flatMap(function (coding) {
            if (filter.system && coding.system !== filter.system)
                return [];
            if (filter.version && coding.version !== filter.version)
                return [];
            return coding.code ? [coding.code] : [];
        })) !== null && _b !== void 0 ? _b : []);
    };
    FHIRResource.prototype.containsCoding = function (concept, filter) {
        return filter.some(function (filterCoding) {
            var _a, _b;
            return (_b = (_a = concept === null || concept === void 0 ? void 0 : concept.coding) === null || _a === void 0 ? void 0 : _a.some(function (coding) {
                if (filterCoding.code && coding.code !== filterCoding.code)
                    return false;
                if (filterCoding.system && coding.system !== filterCoding.system)
                    return false;
                if (filterCoding.version && coding.version !== filterCoding.version)
                    return false;
                return true;
            })) !== null && _b !== void 0 ? _b : false;
        });
    };
    return FHIRResource;
}(FHIRElement));
export { FHIRResource };
export var fhirMedicationRequestConverter = new SchemaConverter({
    schema: fhirResourceConverter.value.schema
        .extend({
        medicationReference: optionalish(z.lazy(function () { return fhirReferenceConverter.value.schema; })),
        dosageInstruction: optionalish(z.lazy(function () { return fhirDosageConverter.value.schema; }).array()),
    })
        .transform(function (values) { return new FHIRMedicationRequest(values); }),
    encode: function (object) { return (__assign(__assign({}, fhirResourceConverter.value.encode(object)), { medicationReference: object.medicationReference ?
            fhirReferenceConverter.value.encode(object.medicationReference)
            : null, dosageInstruction: object.dosageInstruction ?
            object.dosageInstruction.map(fhirDosageConverter.value.encode)
            : null })); },
});
var FHIRMedicationRequest = /** @class */ (function (_super) {
    __extends(FHIRMedicationRequest, _super);
    // Constructor
    function FHIRMedicationRequest(input) {
        var _this = _super.call(this, input) || this;
        // Properties
        _this.resourceType = 'MedicationRequest';
        _this.medicationReference = input.medicationReference;
        _this.dosageInstruction = input.dosageInstruction;
        return _this;
    }
    // Static Functions
    FHIRMedicationRequest.create = function (input) {
        return new FHIRMedicationRequest({
            medicationReference: {
                reference: input.drugReference,
            },
            dosageInstruction: [
                {
                    timing: {
                        repeat: {
                            frequency: input.frequencyPerDay,
                            period: 1,
                            periodUnit: 'd',
                        },
                    },
                    doseAndRate: [
                        {
                            doseQuantity: __assign(__assign({}, QuantityUnit.tablet), { value: input.quantity }),
                        },
                    ],
                },
            ],
        });
    };
    return FHIRMedicationRequest;
}(FHIRResource));
export { FHIRMedicationRequest };
