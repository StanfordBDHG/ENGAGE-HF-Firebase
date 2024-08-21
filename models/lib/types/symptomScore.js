//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { z } from 'zod';
import { Lazy } from '../helpers/lazy.js';
import { dateConverter } from '../helpers/dateConverter.js';
import { optionalish } from '../helpers/optionalish.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var symptomScoreConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z
            .object({
            questionnaireResponseId: optionalish(z.string()),
            date: dateConverter.schema,
            overallScore: z.number().min(0).max(100),
            physicalLimitsScore: optionalish(z.number().min(0).max(100)),
            symptomFrequencyScore: optionalish(z.number().min(0).max(100)),
            socialLimitsScore: optionalish(z.number().min(0).max(100)),
            qualityOfLifeScore: optionalish(z.number().min(0).max(100)),
            dizzinessScore: z.number().min(0).max(5),
        })
            .transform(function (values) { return new SymptomScore(values); }),
        encode: function (object) {
            var _a, _b, _c, _d, _e;
            return ({
                questionnaireResponseId: (_a = object.questionnaireResponseId) !== null && _a !== void 0 ? _a : null,
                date: dateConverter.encode(object.date),
                overallScore: object.overallScore,
                physicalLimitsScore: (_b = object.physicalLimitsScore) !== null && _b !== void 0 ? _b : null,
                symptomFrequencyScore: (_c = object.symptomFrequencyScore) !== null && _c !== void 0 ? _c : null,
                socialLimitsScore: (_d = object.socialLimitsScore) !== null && _d !== void 0 ? _d : null,
                qualityOfLifeScore: (_e = object.qualityOfLifeScore) !== null && _e !== void 0 ? _e : null,
                dizzinessScore: object.dizzinessScore,
            });
        },
    });
});
var SymptomScore = /** @class */ (function () {
    // Constructor
    function SymptomScore(input) {
        this.questionnaireResponseId = input.questionnaireResponseId;
        this.date = input.date;
        this.overallScore = input.overallScore;
        this.physicalLimitsScore = input.physicalLimitsScore;
        this.symptomFrequencyScore = input.symptomFrequencyScore;
        this.socialLimitsScore = input.socialLimitsScore;
        this.qualityOfLifeScore = input.qualityOfLifeScore;
        this.dizzinessScore = input.dizzinessScore;
    }
    return SymptomScore;
}());
export { SymptomScore };
