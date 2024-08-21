import { z } from 'zod';
import { Lazy } from '../../helpers/lazy.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
export declare const fhirCodeableConceptConverter: Lazy<SchemaConverter<z.ZodObject<{
    coding: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodObject<z.objectUtil.extendShape<{
        id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        extension: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodType<import("./fhirElement.js").FHIRExtension, z.ZodTypeDef, import("./fhirElement.js").FHIRExtensionInput>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    }, {
        system: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        version: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        code: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        display: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        userSelected: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    }>, "strip", z.ZodTypeAny, {
        code?: string | undefined;
        system?: string | undefined;
        display?: string | undefined;
        id?: string | undefined;
        extension?: import("./fhirElement.js").FHIRExtension[] | undefined;
        version?: string | undefined;
        userSelected?: boolean | undefined;
    }, {
        code?: string | null | undefined;
        system?: string | null | undefined;
        display?: string | null | undefined;
        id?: string | null | undefined;
        extension?: import("./fhirElement.js").FHIRExtensionInput[] | null | undefined;
        version?: string | null | undefined;
        userSelected?: boolean | null | undefined;
    }>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    text: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, "strip", z.ZodTypeAny, {
    text?: string | undefined;
    coding?: {
        code?: string | undefined;
        system?: string | undefined;
        display?: string | undefined;
        id?: string | undefined;
        extension?: import("./fhirElement.js").FHIRExtension[] | undefined;
        version?: string | undefined;
        userSelected?: boolean | undefined;
    }[] | undefined;
}, {
    text?: string | null | undefined;
    coding?: {
        code?: string | null | undefined;
        system?: string | null | undefined;
        display?: string | null | undefined;
        id?: string | null | undefined;
        extension?: import("./fhirElement.js").FHIRExtensionInput[] | null | undefined;
        version?: string | null | undefined;
        userSelected?: boolean | null | undefined;
    }[] | null | undefined;
}>>>;
export type FHIRCodeableConcept = z.output<typeof fhirCodeableConceptConverter.value.schema>;
