import { z } from 'zod';
import { Lazy } from '../../helpers/lazy.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
export declare const fhirRatioConverter: Lazy<SchemaConverter<z.ZodObject<{
    numerator: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
        code: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        system: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        unit: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        value: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    }, "strip", z.ZodTypeAny, {
        value?: number | undefined;
        code?: string | undefined;
        system?: string | undefined;
        unit?: string | undefined;
    }, {
        value?: number | null | undefined;
        code?: string | null | undefined;
        system?: string | null | undefined;
        unit?: string | null | undefined;
    }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    denominator: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
        code: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        system: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        unit: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        value: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    }, "strip", z.ZodTypeAny, {
        value?: number | undefined;
        code?: string | undefined;
        system?: string | undefined;
        unit?: string | undefined;
    }, {
        value?: number | null | undefined;
        code?: string | null | undefined;
        system?: string | null | undefined;
        unit?: string | null | undefined;
    }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, "strip", z.ZodTypeAny, {
    numerator?: {
        value?: number | undefined;
        code?: string | undefined;
        system?: string | undefined;
        unit?: string | undefined;
    } | undefined;
    denominator?: {
        value?: number | undefined;
        code?: string | undefined;
        system?: string | undefined;
        unit?: string | undefined;
    } | undefined;
}, {
    numerator?: {
        value?: number | null | undefined;
        code?: string | null | undefined;
        system?: string | null | undefined;
        unit?: string | null | undefined;
    } | null | undefined;
    denominator?: {
        value?: number | null | undefined;
        code?: string | null | undefined;
        system?: string | null | undefined;
        unit?: string | null | undefined;
    } | null | undefined;
}>>>;
export type FHIRRatio = z.output<typeof fhirRatioConverter.value.schema>;
