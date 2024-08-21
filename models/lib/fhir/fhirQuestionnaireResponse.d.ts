import { z } from 'zod';
import { FHIRResource, type FHIRResourceInput } from './baseTypes/fhirElement.js';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
import { type SymptomQuestionnaireResponse } from '../symptomQuestionnaireResponse.js';
export declare const fhirQuestionnaireResponseItemConverter: Lazy<SchemaConverter<z.ZodObject<{
    answer: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
        valueCoding: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<z.objectUtil.extendShape<{
            id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
            extension: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodType<import("./baseTypes/fhirElement.js").FHIRExtension, z.ZodTypeDef, import("./baseTypes/fhirElement.js").FHIRExtensionInput>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        }, {
            system: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
            version: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
            code: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
            display: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
            userSelected: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        }>, "strip", z.ZodTypeAny, {
            code?: string | undefined;
            id?: string | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
            system?: string | undefined;
            display?: string | undefined;
            version?: string | undefined;
            userSelected?: boolean | undefined;
        }, {
            code?: string | null | undefined;
            id?: string | null | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
            system?: string | null | undefined;
            display?: string | null | undefined;
            version?: string | null | undefined;
            userSelected?: boolean | null | undefined;
        }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    }, "strip", z.ZodTypeAny, {
        valueCoding?: {
            code?: string | undefined;
            id?: string | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
            system?: string | undefined;
            display?: string | undefined;
            version?: string | undefined;
            userSelected?: boolean | undefined;
        } | undefined;
    }, {
        valueCoding?: {
            code?: string | null | undefined;
            id?: string | null | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
            system?: string | null | undefined;
            display?: string | null | undefined;
            version?: string | null | undefined;
            userSelected?: boolean | null | undefined;
        } | null | undefined;
    }>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    linkId: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, "strip", z.ZodTypeAny, {
    answer?: {
        valueCoding?: {
            code?: string | undefined;
            id?: string | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
            system?: string | undefined;
            display?: string | undefined;
            version?: string | undefined;
            userSelected?: boolean | undefined;
        } | undefined;
    }[] | undefined;
    linkId?: string | undefined;
}, {
    answer?: {
        valueCoding?: {
            code?: string | null | undefined;
            id?: string | null | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
            system?: string | null | undefined;
            display?: string | null | undefined;
            version?: string | null | undefined;
            userSelected?: boolean | null | undefined;
        } | null | undefined;
    }[] | null | undefined;
    linkId?: string | null | undefined;
}>>>;
export type FHIRQuestionnaireResponseItem = z.output<typeof fhirQuestionnaireResponseItemConverter.value.schema>;
export declare const fhirQuestionnaireResponseConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    extension: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodType<import("./baseTypes/fhirElement.js").FHIRExtension, z.ZodTypeDef, import("./baseTypes/fhirElement.js").FHIRExtensionInput>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, {
    resourceType: z.ZodString;
}>, {
    authored: z.ZodEffects<z.ZodString, Date, string>;
    item: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodObject<{
        answer: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodObject<{
            valueCoding: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<z.objectUtil.extendShape<{
                id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
                extension: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodType<import("./baseTypes/fhirElement.js").FHIRExtension, z.ZodTypeDef, import("./baseTypes/fhirElement.js").FHIRExtensionInput>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
            }, {
                system: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
                version: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
                code: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
                display: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
                userSelected: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodEffects<z.ZodNull, undefined, null>]>>;
            }>, "strip", z.ZodTypeAny, {
                code?: string | undefined;
                id?: string | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
                system?: string | undefined;
                display?: string | undefined;
                version?: string | undefined;
                userSelected?: boolean | undefined;
            }, {
                code?: string | null | undefined;
                id?: string | null | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
                system?: string | null | undefined;
                display?: string | null | undefined;
                version?: string | null | undefined;
                userSelected?: boolean | null | undefined;
            }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        }, "strip", z.ZodTypeAny, {
            valueCoding?: {
                code?: string | undefined;
                id?: string | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
                system?: string | undefined;
                display?: string | undefined;
                version?: string | undefined;
                userSelected?: boolean | undefined;
            } | undefined;
        }, {
            valueCoding?: {
                code?: string | null | undefined;
                id?: string | null | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
                system?: string | null | undefined;
                display?: string | null | undefined;
                version?: string | null | undefined;
                userSelected?: boolean | null | undefined;
            } | null | undefined;
        }>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        linkId: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    }, "strip", z.ZodTypeAny, {
        answer?: {
            valueCoding?: {
                code?: string | undefined;
                id?: string | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
                system?: string | undefined;
                display?: string | undefined;
                version?: string | undefined;
                userSelected?: boolean | undefined;
            } | undefined;
        }[] | undefined;
        linkId?: string | undefined;
    }, {
        answer?: {
            valueCoding?: {
                code?: string | null | undefined;
                id?: string | null | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
                system?: string | null | undefined;
                display?: string | null | undefined;
                version?: string | null | undefined;
                userSelected?: boolean | null | undefined;
            } | null | undefined;
        }[] | null | undefined;
        linkId?: string | null | undefined;
    }>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    questionnaire: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    resourceType: string;
    authored: Date;
    questionnaire: string;
    id?: string | undefined;
    extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
    item?: {
        answer?: {
            valueCoding?: {
                code?: string | undefined;
                id?: string | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
                system?: string | undefined;
                display?: string | undefined;
                version?: string | undefined;
                userSelected?: boolean | undefined;
            } | undefined;
        }[] | undefined;
        linkId?: string | undefined;
    }[] | undefined;
}, {
    resourceType: string;
    authored: string;
    questionnaire: string;
    id?: string | null | undefined;
    extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
    item?: {
        answer?: {
            valueCoding?: {
                code?: string | null | undefined;
                id?: string | null | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
                system?: string | null | undefined;
                display?: string | null | undefined;
                version?: string | null | undefined;
                userSelected?: boolean | null | undefined;
            } | null | undefined;
        }[] | null | undefined;
        linkId?: string | null | undefined;
    }[] | null | undefined;
}>, FHIRQuestionnaireResponse, {
    resourceType: string;
    authored: string;
    questionnaire: string;
    id?: string | null | undefined;
    extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
    item?: {
        answer?: {
            valueCoding?: {
                code?: string | null | undefined;
                id?: string | null | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
                system?: string | null | undefined;
                display?: string | null | undefined;
                version?: string | null | undefined;
                userSelected?: boolean | null | undefined;
            } | null | undefined;
        }[] | null | undefined;
        linkId?: string | null | undefined;
    }[] | null | undefined;
}>>>;
export declare class FHIRQuestionnaireResponse extends FHIRResource {
    static create(input: SymptomQuestionnaireResponse): FHIRQuestionnaireResponse;
    readonly resourceType: string;
    readonly authored: Date;
    readonly item?: FHIRQuestionnaireResponseItem[];
    readonly questionnaire: string;
    get symptomQuestionnaireResponse(): SymptomQuestionnaireResponse;
    constructor(input: FHIRResourceInput & {
        authored: Date;
        item?: FHIRQuestionnaireResponseItem[];
        questionnaire: string;
    });
    numericSingleAnswerForLink(linkId: string): number;
}
