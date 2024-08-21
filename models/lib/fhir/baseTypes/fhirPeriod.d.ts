import { z } from 'zod';
import { Lazy } from '../../helpers/lazy.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
export declare const fhirPeriodConverter: Lazy<SchemaConverter<z.ZodObject<{
    start: z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    end: z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, "strip", z.ZodTypeAny, {
    start?: Date | undefined;
    end?: Date | undefined;
}, {
    start?: string | null | undefined;
    end?: string | null | undefined;
}>>>;
export type FHIRPeriod = z.output<typeof fhirPeriodConverter.value.schema>;
