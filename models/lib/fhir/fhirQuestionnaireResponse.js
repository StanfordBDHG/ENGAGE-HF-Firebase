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
import { fhirCodingConverter } from './baseTypes/fhirCoding.js';
import { FHIRResource, fhirResourceConverter, } from './baseTypes/fhirElement.js';
import { Lazy } from '../helpers/lazy.js';
import { symptomQuestionnaireLinkIds } from '../codes/symptomQuestionnaireLinkIds.js';
import { dateConverter } from '../helpers/dateConverter.js';
import { optionalish } from '../helpers/optionalish.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var fhirQuestionnaireResponseItemConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            answer: optionalish(z
                .object({
                valueCoding: optionalish(z.lazy(function () { return fhirCodingConverter.value.schema; })),
            })
                .array()),
            linkId: optionalish(z.string()),
        }),
        encode: function (object) {
            var _a, _b, _c;
            return ({
                answer: (_b = (_a = object.answer) === null || _a === void 0 ? void 0 : _a.flatMap(function (value) { return ({
                    valueCoding: value.valueCoding ?
                        fhirCodingConverter.value.encode(value.valueCoding)
                        : null,
                }); })) !== null && _b !== void 0 ? _b : null,
                linkId: (_c = object.linkId) !== null && _c !== void 0 ? _c : null,
            });
        },
    });
});
export var fhirQuestionnaireResponseConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: fhirResourceConverter.value.schema
            .extend({
            authored: dateConverter.schema,
            item: optionalish(z
                .lazy(function () { return fhirQuestionnaireResponseItemConverter.value.schema; })
                .array()),
            questionnaire: z.string(),
        })
            .transform(function (values) { return new FHIRQuestionnaireResponse(values); }),
        encode: function (object) {
            var _a, _b;
            return (__assign(__assign({}, fhirResourceConverter.value.encode(object)), { authored: dateConverter.encode(object.authored), item: (_b = (_a = object.item) === null || _a === void 0 ? void 0 : _a.map(fhirQuestionnaireResponseItemConverter.value.encode)) !== null && _b !== void 0 ? _b : null, questionnaire: object.questionnaire }));
        },
    });
});
var FHIRQuestionnaireResponse = /** @class */ (function (_super) {
    __extends(FHIRQuestionnaireResponse, _super);
    // Constructor
    function FHIRQuestionnaireResponse(input) {
        var _this = _super.call(this, input) || this;
        // Stored Properties
        _this.resourceType = 'QuestionnaireResponse';
        _this.authored = input.authored;
        _this.item = input.item;
        _this.questionnaire = input.questionnaire;
        return _this;
    }
    // Static Functions
    FHIRQuestionnaireResponse.create = function (input) {
        var linkIds = symptomQuestionnaireLinkIds(input.questionnaire);
        return new FHIRQuestionnaireResponse({
            id: input.questionnaireResponse,
            questionnaire: input.questionnaire,
            authored: input.date,
            item: [
                {
                    linkId: linkIds.question1a,
                    answer: [
                        {
                            valueCoding: {
                                code: input.answer1a.toString(),
                            },
                        },
                    ],
                },
                {
                    linkId: linkIds.question1b,
                    answer: [
                        {
                            valueCoding: {
                                code: input.answer1b.toString(),
                            },
                        },
                    ],
                },
                {
                    linkId: linkIds.question1c,
                    answer: [
                        {
                            valueCoding: {
                                code: input.answer1c.toString(),
                            },
                        },
                    ],
                },
                {
                    linkId: linkIds.question2,
                    answer: [
                        {
                            valueCoding: {
                                code: input.answer2.toString(),
                            },
                        },
                    ],
                },
                {
                    linkId: linkIds.question3,
                    answer: [
                        {
                            valueCoding: {
                                code: input.answer3.toString(),
                            },
                        },
                    ],
                },
                {
                    linkId: linkIds.question4,
                    answer: [
                        {
                            valueCoding: {
                                code: input.answer4.toString(),
                            },
                        },
                    ],
                },
                {
                    linkId: linkIds.question5,
                    answer: [
                        {
                            valueCoding: {
                                code: input.answer5.toString(),
                            },
                        },
                    ],
                },
                {
                    linkId: linkIds.question6,
                    answer: [
                        {
                            valueCoding: {
                                code: input.answer6.toString(),
                            },
                        },
                    ],
                },
                {
                    linkId: linkIds.question7,
                    answer: [
                        {
                            valueCoding: {
                                code: input.answer7.toString(),
                            },
                        },
                    ],
                },
                {
                    linkId: linkIds.question8a,
                    answer: [
                        {
                            valueCoding: {
                                code: input.answer8a.toString(),
                            },
                        },
                    ],
                },
                {
                    linkId: linkIds.question8b,
                    answer: [
                        {
                            valueCoding: {
                                code: input.answer8b.toString(),
                            },
                        },
                    ],
                },
                {
                    linkId: linkIds.question8c,
                    answer: [
                        {
                            valueCoding: {
                                code: input.answer8c.toString(),
                            },
                        },
                    ],
                },
                {
                    linkId: linkIds.question9,
                    answer: [
                        {
                            valueCoding: {
                                code: input.answer9.toString(),
                            },
                        },
                    ],
                },
            ],
        });
    };
    Object.defineProperty(FHIRQuestionnaireResponse.prototype, "symptomQuestionnaireResponse", {
        // Computed Properties
        get: function () {
            var _a;
            var linkIds = symptomQuestionnaireLinkIds(this.questionnaire);
            return {
                questionnaire: this.questionnaire,
                questionnaireResponse: (_a = this.id) !== null && _a !== void 0 ? _a : undefined,
                date: this.authored,
                answer1a: this.numericSingleAnswerForLink(linkIds.question1a),
                answer1b: this.numericSingleAnswerForLink(linkIds.question1b),
                answer1c: this.numericSingleAnswerForLink(linkIds.question1c),
                answer2: this.numericSingleAnswerForLink(linkIds.question2),
                answer3: this.numericSingleAnswerForLink(linkIds.question3),
                answer4: this.numericSingleAnswerForLink(linkIds.question4),
                answer5: this.numericSingleAnswerForLink(linkIds.question5),
                answer6: this.numericSingleAnswerForLink(linkIds.question6),
                answer7: this.numericSingleAnswerForLink(linkIds.question7),
                answer8a: this.numericSingleAnswerForLink(linkIds.question8a),
                answer8b: this.numericSingleAnswerForLink(linkIds.question8b),
                answer8c: this.numericSingleAnswerForLink(linkIds.question8c),
                answer9: this.numericSingleAnswerForLink(linkIds.question9),
            };
        },
        enumerable: false,
        configurable: true
    });
    // Methods
    FHIRQuestionnaireResponse.prototype.numericSingleAnswerForLink = function (linkId) {
        var _a, _b, _c, _d;
        var answers = (_c = (_b = (_a = this.item) === null || _a === void 0 ? void 0 : _a.find(function (item) { return item.linkId === linkId; })) === null || _b === void 0 ? void 0 : _b.answer) !== null && _c !== void 0 ? _c : [];
        if (answers.length !== 1)
            throw new Error("Zero or multiple answers found for linkId ".concat(linkId, "."));
        var code = (_d = answers[0].valueCoding) === null || _d === void 0 ? void 0 : _d.code;
        if (!code)
            throw new Error("No answer code found for linkId ".concat(linkId, "."));
        return parseInt(code);
    };
    return FHIRQuestionnaireResponse;
}(FHIRResource));
export { FHIRQuestionnaireResponse };
