import { z } from 'zod';
import { Lazy } from '../../helpers/lazy.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
export declare const fhirReferenceConverter: Lazy<SchemaConverter<z.ZodObject<{
    reference: z.ZodString;
    type: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    display: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    identifier: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, "strip", z.ZodTypeAny, {
    reference: string;
    type?: string | undefined;
    display?: string | undefined;
    identifier?: string | undefined;
}, {
    reference: string;
    type?: string | null | undefined;
    display?: string | null | undefined;
    identifier?: string | null | undefined;
}>>>;
export type FHIRReference = z.output<typeof fhirReferenceConverter.value.schema>;
