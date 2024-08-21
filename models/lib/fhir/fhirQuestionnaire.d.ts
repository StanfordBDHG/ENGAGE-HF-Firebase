import { z } from 'zod';
import { FHIRResource, type FHIRResourceInput } from './baseTypes/fhirElement.js';
import { type FHIRQuestionnaireItem } from './baseTypes/fhirQuestionnaireItem.js';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare enum FHIRQuestionnairePublicationStatus {
    draft = "draft",
    active = "active",
    retired = "retired",
    unknown = "unknown"
}
export declare const fhirQuestionnaireConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    extension: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodType<import("./baseTypes/fhirElement.js").FHIRExtension, z.ZodTypeDef, import("./baseTypes/fhirElement.js").FHIRExtensionInput>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, {
    resourceType: z.ZodString;
}>, {
    status: z.ZodNativeEnum<typeof FHIRQuestionnairePublicationStatus>;
    title: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    language: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    publisher: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    url: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    item: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodType<FHIRQuestionnaireItem, z.ZodTypeDef, import("./baseTypes/fhirQuestionnaireItem.js").FHIRQuestionnaireItemInput>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}>, "strip", z.ZodTypeAny, {
    status: FHIRQuestionnairePublicationStatus;
    resourceType: string;
    url?: string | undefined;
    id?: string | undefined;
    extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
    item?: FHIRQuestionnaireItem[] | undefined;
    title?: string | undefined;
    language?: string | undefined;
    publisher?: string | undefined;
}, {
    status: FHIRQuestionnairePublicationStatus;
    resourceType: string;
    url?: string | null | undefined;
    id?: string | null | undefined;
    extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
    item?: import("./baseTypes/fhirQuestionnaireItem.js").FHIRQuestionnaireItemInput[] | null | undefined;
    title?: string | null | undefined;
    language?: string | null | undefined;
    publisher?: string | null | undefined;
}>, FHIRQuestionnaire, {
    status: FHIRQuestionnairePublicationStatus;
    resourceType: string;
    url?: string | null | undefined;
    id?: string | null | undefined;
    extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
    item?: import("./baseTypes/fhirQuestionnaireItem.js").FHIRQuestionnaireItemInput[] | null | undefined;
    title?: string | null | undefined;
    language?: string | null | undefined;
    publisher?: string | null | undefined;
}>>>;
export declare class FHIRQuestionnaire extends FHIRResource {
    readonly resourceType: string;
    readonly title?: string;
    readonly status: FHIRQuestionnairePublicationStatus;
    readonly language?: string;
    readonly publisher?: string;
    readonly url?: string;
    readonly item?: FHIRQuestionnaireItem[];
    constructor(input: FHIRResourceInput & {
        title?: string;
        status: FHIRQuestionnairePublicationStatus;
        language?: string;
        publisher?: string;
        url?: string;
        item?: FHIRQuestionnaireItem[];
    });
}
