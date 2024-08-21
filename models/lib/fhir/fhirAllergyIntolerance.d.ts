import { z } from 'zod';
import { type FHIRCodeableConcept } from './baseTypes/fhirCodeableConcept.js';
import { FHIRResource, type FHIRResourceInput } from './baseTypes/fhirElement.js';
import { Lazy } from '../helpers/lazy.js';
import { type MedicationReference } from '../codes/references.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare enum FHIRAllergyIntoleranceType {
    allergy = "allergy",
    intolerance = "intolerance",
    financial = "financial",
    preference = "preference"
}
export declare enum FHIRAllergyIntoleranceCriticality {
    low = "low",
    high = "high",
    unableToAssess = "unable-to-assess"
}
export declare const fhirAllergyIntoleranceConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    extension: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodType<import("./baseTypes/fhirElement.js").FHIRExtension, z.ZodTypeDef, import("./baseTypes/fhirElement.js").FHIRExtensionInput>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, {
    resourceType: z.ZodString;
}>, {
    type: z.ZodNativeEnum<typeof FHIRAllergyIntoleranceType>;
    criticality: z.ZodOptional<z.ZodUnion<[z.ZodNativeEnum<typeof FHIRAllergyIntoleranceCriticality>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    code: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
        coding: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodObject<z.objectUtil.extendShape<{
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
            system?: string | undefined;
            display?: string | undefined;
            id?: string | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
            version?: string | undefined;
            userSelected?: boolean | undefined;
        }, {
            code?: string | null | undefined;
            system?: string | null | undefined;
            display?: string | null | undefined;
            id?: string | null | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
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
            extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
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
            extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
            version?: string | null | undefined;
            userSelected?: boolean | null | undefined;
        }[] | null | undefined;
    }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}>, "strip", z.ZodTypeAny, {
    type: FHIRAllergyIntoleranceType;
    resourceType: string;
    code?: {
        text?: string | undefined;
        coding?: {
            code?: string | undefined;
            system?: string | undefined;
            display?: string | undefined;
            id?: string | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
            version?: string | undefined;
            userSelected?: boolean | undefined;
        }[] | undefined;
    } | undefined;
    id?: string | undefined;
    extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
    criticality?: FHIRAllergyIntoleranceCriticality | undefined;
}, {
    type: FHIRAllergyIntoleranceType;
    resourceType: string;
    code?: {
        text?: string | null | undefined;
        coding?: {
            code?: string | null | undefined;
            system?: string | null | undefined;
            display?: string | null | undefined;
            id?: string | null | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
            version?: string | null | undefined;
            userSelected?: boolean | null | undefined;
        }[] | null | undefined;
    } | null | undefined;
    id?: string | null | undefined;
    extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
    criticality?: FHIRAllergyIntoleranceCriticality | null | undefined;
}>, FHIRAllergyIntolerance, {
    type: FHIRAllergyIntoleranceType;
    resourceType: string;
    code?: {
        text?: string | null | undefined;
        coding?: {
            code?: string | null | undefined;
            system?: string | null | undefined;
            display?: string | null | undefined;
            id?: string | null | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
            version?: string | null | undefined;
            userSelected?: boolean | null | undefined;
        }[] | null | undefined;
    } | null | undefined;
    id?: string | null | undefined;
    extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
    criticality?: FHIRAllergyIntoleranceCriticality | null | undefined;
}>>>;
export declare class FHIRAllergyIntolerance extends FHIRResource {
    static create(input: {
        type: FHIRAllergyIntoleranceType;
        criticality?: FHIRAllergyIntoleranceCriticality;
        reference: MedicationReference;
    }): FHIRAllergyIntolerance;
    readonly resourceType: string;
    readonly type: FHIRAllergyIntoleranceType;
    readonly criticality?: FHIRAllergyIntoleranceCriticality;
    readonly code?: FHIRCodeableConcept;
    get rxNormCodes(): string[];
    constructor(input: FHIRResourceInput & {
        type: FHIRAllergyIntoleranceType;
        criticality?: FHIRAllergyIntoleranceCriticality;
        code?: FHIRCodeableConcept;
    });
}
