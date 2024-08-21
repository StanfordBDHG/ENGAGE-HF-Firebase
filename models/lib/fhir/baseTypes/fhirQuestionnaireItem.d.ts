import { z } from 'zod';
import { Lazy } from '../../helpers/lazy.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
export declare enum FHIRQuestionnaireItemType {
    group = "group",
    display = "display",
    choice = "choice"
}
declare const fhirQuestionnaireItemBaseConverter: Lazy<SchemaConverter<z.ZodObject<{
    linkId: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    type: z.ZodOptional<z.ZodUnion<[z.ZodNativeEnum<typeof FHIRQuestionnaireItemType>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    text: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    required: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    answerOption: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
        valueCoding: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<z.objectUtil.extendShape<{
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
        }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    }, "strip", z.ZodTypeAny, {
        valueCoding?: {
            code?: string | undefined;
            system?: string | undefined;
            display?: string | undefined;
            id?: string | undefined;
            extension?: import("./fhirElement.js").FHIRExtension[] | undefined;
            version?: string | undefined;
            userSelected?: boolean | undefined;
        } | undefined;
    }, {
        valueCoding?: {
            code?: string | null | undefined;
            system?: string | null | undefined;
            display?: string | null | undefined;
            id?: string | null | undefined;
            extension?: import("./fhirElement.js").FHIRExtensionInput[] | null | undefined;
            version?: string | null | undefined;
            userSelected?: boolean | null | undefined;
        } | null | undefined;
    }>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, "strip", z.ZodTypeAny, {
    type?: FHIRQuestionnaireItemType | undefined;
    text?: string | undefined;
    linkId?: string | undefined;
    required?: boolean | undefined;
    answerOption?: {
        valueCoding?: {
            code?: string | undefined;
            system?: string | undefined;
            display?: string | undefined;
            id?: string | undefined;
            extension?: import("./fhirElement.js").FHIRExtension[] | undefined;
            version?: string | undefined;
            userSelected?: boolean | undefined;
        } | undefined;
    }[] | undefined;
}, {
    type?: FHIRQuestionnaireItemType | null | undefined;
    text?: string | null | undefined;
    linkId?: string | null | undefined;
    required?: boolean | null | undefined;
    answerOption?: {
        valueCoding?: {
            code?: string | null | undefined;
            system?: string | null | undefined;
            display?: string | null | undefined;
            id?: string | null | undefined;
            extension?: import("./fhirElement.js").FHIRExtensionInput[] | null | undefined;
            version?: string | null | undefined;
            userSelected?: boolean | null | undefined;
        } | null | undefined;
    }[] | null | undefined;
}>>>;
export interface FHIRQuestionnaireItemInput extends z.input<typeof fhirQuestionnaireItemBaseConverter.value.schema> {
    item?: FHIRQuestionnaireItemInput[] | null | undefined;
}
export interface FHIRQuestionnaireItem extends z.output<typeof fhirQuestionnaireItemBaseConverter.value.schema> {
    item?: FHIRQuestionnaireItem[];
}
export declare const fhirQuestionnaireItemConverter: Lazy<SchemaConverter<z.ZodType<FHIRQuestionnaireItem, z.ZodTypeDef, FHIRQuestionnaireItemInput>>>;
export {};
