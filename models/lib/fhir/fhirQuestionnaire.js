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
import { FHIRResource, fhirResourceConverter, } from './baseTypes/fhirElement.js';
import { fhirQuestionnaireItemConverter, } from './baseTypes/fhirQuestionnaireItem.js';
import { Lazy } from '../helpers/lazy.js';
import { optionalish } from '../helpers/optionalish.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var FHIRQuestionnairePublicationStatus;
(function (FHIRQuestionnairePublicationStatus) {
    FHIRQuestionnairePublicationStatus["draft"] = "draft";
    FHIRQuestionnairePublicationStatus["active"] = "active";
    FHIRQuestionnairePublicationStatus["retired"] = "retired";
    FHIRQuestionnairePublicationStatus["unknown"] = "unknown";
})(FHIRQuestionnairePublicationStatus || (FHIRQuestionnairePublicationStatus = {}));
export var fhirQuestionnaireConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: fhirResourceConverter.value.schema
            .extend({
            status: z.nativeEnum(FHIRQuestionnairePublicationStatus),
            title: optionalish(z.string()),
            language: optionalish(z.string()),
            publisher: optionalish(z.string()),
            url: optionalish(z.string()),
            item: optionalish(z.lazy(function () { return fhirQuestionnaireItemConverter.value.schema; }).array()),
        })
            .transform(function (values) { return new FHIRQuestionnaire(values); }),
        encode: function (object) {
            var _a, _b, _c, _d, _e, _f;
            return (__assign(__assign({}, fhirResourceConverter.value.encode(object)), { title: (_a = object.title) !== null && _a !== void 0 ? _a : null, status: object.status, language: (_b = object.language) !== null && _b !== void 0 ? _b : null, publisher: (_c = object.publisher) !== null && _c !== void 0 ? _c : null, url: (_d = object.url) !== null && _d !== void 0 ? _d : null, item: (_f = (_e = object.item) === null || _e === void 0 ? void 0 : _e.map(fhirQuestionnaireItemConverter.value.encode)) !== null && _f !== void 0 ? _f : null }));
        },
    });
});
var FHIRQuestionnaire = /** @class */ (function (_super) {
    __extends(FHIRQuestionnaire, _super);
    // Constructor
    function FHIRQuestionnaire(input) {
        var _this = _super.call(this, input) || this;
        // Properties
        _this.resourceType = 'Questionnaire';
        _this.title = input.title;
        _this.status = input.status;
        _this.language = input.language;
        _this.publisher = input.publisher;
        _this.url = input.url;
        _this.item = input.item;
        return _this;
    }
    return FHIRQuestionnaire;
}(FHIRResource));
export { FHIRQuestionnaire };
