import { z } from 'zod';
import { Lazy } from '../../helpers/lazy.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
export declare const fhirDosageConverter: Lazy<SchemaConverter<z.ZodObject<{
    text: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    patientInstruction: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    timing: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
        repeat: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
            frequency: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodNull, undefined, null>]>>;
            period: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodNull, undefined, null>]>>;
            periodUnit: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
            timeOfDay: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodString, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        }, "strip", z.ZodTypeAny, {
            frequency?: number | undefined;
            period?: number | undefined;
            periodUnit?: string | undefined;
            timeOfDay?: string[] | undefined;
        }, {
            frequency?: number | null | undefined;
            period?: number | null | undefined;
            periodUnit?: string | null | undefined;
            timeOfDay?: string[] | null | undefined;
        }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        code: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
        }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    }, "strip", z.ZodTypeAny, {
        code?: {
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
        } | undefined;
        repeat?: {
            frequency?: number | undefined;
            period?: number | undefined;
            periodUnit?: string | undefined;
            timeOfDay?: string[] | undefined;
        } | undefined;
    }, {
        code?: {
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
        } | null | undefined;
        repeat?: {
            frequency?: number | null | undefined;
            period?: number | null | undefined;
            periodUnit?: string | null | undefined;
            timeOfDay?: string[] | null | undefined;
        } | null | undefined;
    }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    doseAndRate: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodObject<{
        type: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
        }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        doseQuantity: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
        type?: {
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
        } | undefined;
        doseQuantity?: {
            value?: number | undefined;
            code?: string | undefined;
            system?: string | undefined;
            unit?: string | undefined;
        } | undefined;
    }, {
        type?: {
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
        } | null | undefined;
        doseQuantity?: {
            value?: number | null | undefined;
            code?: string | null | undefined;
            system?: string | null | undefined;
            unit?: string | null | undefined;
        } | null | undefined;
    }>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, "strip", z.ZodTypeAny, {
    text?: string | undefined;
    patientInstruction?: string | undefined;
    timing?: {
        code?: {
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
        } | undefined;
        repeat?: {
            frequency?: number | undefined;
            period?: number | undefined;
            periodUnit?: string | undefined;
            timeOfDay?: string[] | undefined;
        } | undefined;
    } | undefined;
    doseAndRate?: {
        type?: {
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
        } | undefined;
        doseQuantity?: {
            value?: number | undefined;
            code?: string | undefined;
            system?: string | undefined;
            unit?: string | undefined;
        } | undefined;
    }[] | undefined;
}, {
    text?: string | null | undefined;
    patientInstruction?: string | null | undefined;
    timing?: {
        code?: {
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
        } | null | undefined;
        repeat?: {
            frequency?: number | null | undefined;
            period?: number | null | undefined;
            periodUnit?: string | null | undefined;
            timeOfDay?: string[] | null | undefined;
        } | null | undefined;
    } | null | undefined;
    doseAndRate?: {
        type?: {
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
        } | null | undefined;
        doseQuantity?: {
            value?: number | null | undefined;
            code?: string | null | undefined;
            system?: string | null | undefined;
            unit?: string | null | undefined;
        } | null | undefined;
    }[] | null | undefined;
}>>>;
export type FHIRDosage = z.output<typeof fhirDosageConverter.value.schema>;
