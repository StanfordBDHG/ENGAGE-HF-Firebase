import { z } from 'zod';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare const symptomScoreConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<{
    questionnaireResponseId: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    date: z.ZodEffects<z.ZodString, Date, string>;
    overallScore: z.ZodNumber;
    physicalLimitsScore: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    symptomFrequencyScore: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    socialLimitsScore: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    qualityOfLifeScore: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    dizzinessScore: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    date: Date;
    overallScore: number;
    dizzinessScore: number;
    questionnaireResponseId?: string | undefined;
    physicalLimitsScore?: number | undefined;
    symptomFrequencyScore?: number | undefined;
    socialLimitsScore?: number | undefined;
    qualityOfLifeScore?: number | undefined;
}, {
    date: string;
    overallScore: number;
    dizzinessScore: number;
    questionnaireResponseId?: string | null | undefined;
    physicalLimitsScore?: number | null | undefined;
    symptomFrequencyScore?: number | null | undefined;
    socialLimitsScore?: number | null | undefined;
    qualityOfLifeScore?: number | null | undefined;
}>, SymptomScore, {
    date: string;
    overallScore: number;
    dizzinessScore: number;
    questionnaireResponseId?: string | null | undefined;
    physicalLimitsScore?: number | null | undefined;
    symptomFrequencyScore?: number | null | undefined;
    socialLimitsScore?: number | null | undefined;
    qualityOfLifeScore?: number | null | undefined;
}>>>;
export declare class SymptomScore {
    readonly questionnaireResponseId?: string;
    readonly date: Date;
    readonly overallScore: number;
    readonly physicalLimitsScore?: number;
    readonly symptomFrequencyScore?: number;
    readonly socialLimitsScore?: number;
    readonly qualityOfLifeScore?: number;
    readonly dizzinessScore: number;
    constructor(input: {
        questionnaireResponseId?: string;
        date: Date;
        overallScore: number;
        physicalLimitsScore?: number;
        symptomFrequencyScore?: number;
        socialLimitsScore?: number;
        qualityOfLifeScore?: number;
        dizzinessScore: number;
    });
}
