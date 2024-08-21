import { z } from 'zod';
import { type FHIRCodeableConcept } from './baseTypes/fhirCodeableConcept.js';
import { FHIRResource, type FHIRResourceInput, type FHIRMedicationRequest } from './baseTypes/fhirElement.js';
import { type FHIRReference } from './baseTypes/fhirReference.js';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare const fhirMedicationIngredientConverter: Lazy<SchemaConverter<z.ZodObject<{
    strength: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
    }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    itemCodeableConcept: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    strength?: {
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
    } | undefined;
    itemCodeableConcept?: {
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
}, {
    strength?: {
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
    } | null | undefined;
    itemCodeableConcept?: {
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
}>>>;
export type FHIRMedicationIngredient = z.output<typeof fhirMedicationIngredientConverter.value.schema>;
export declare const fhirMedicationConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    extension: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodType<import("./baseTypes/fhirElement.js").FHIRExtension, z.ZodTypeDef, import("./baseTypes/fhirElement.js").FHIRExtensionInput>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, {
    resourceType: z.ZodString;
}>, {
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
    form: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
    ingredient: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodObject<{
        strength: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
        }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        itemCodeableConcept: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
    }, "strip", z.ZodTypeAny, {
        strength?: {
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
        } | undefined;
        itemCodeableConcept?: {
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
    }, {
        strength?: {
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
        } | null | undefined;
        itemCodeableConcept?: {
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
    }>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}>, "strip", z.ZodTypeAny, {
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
    form?: {
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
    ingredient?: {
        strength?: {
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
        } | undefined;
        itemCodeableConcept?: {
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
    }[] | undefined;
}, {
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
    form?: {
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
    ingredient?: {
        strength?: {
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
        } | null | undefined;
        itemCodeableConcept?: {
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
    }[] | null | undefined;
}>, FHIRMedication, {
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
    form?: {
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
    ingredient?: {
        strength?: {
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
        } | null | undefined;
        itemCodeableConcept?: {
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
    }[] | null | undefined;
}>>>;
export declare class FHIRMedication extends FHIRResource {
    readonly resourceType: string;
    readonly code?: FHIRCodeableConcept;
    readonly form?: FHIRCodeableConcept;
    readonly ingredient?: FHIRMedicationIngredient[];
    get displayName(): string | undefined;
    get medicationClassReference(): FHIRReference | undefined;
    get minimumDailyDoseRequest(): FHIRMedicationRequest | undefined;
    get minimumDailyDose(): number[] | undefined;
    get targetDailyDoseRequest(): FHIRMedicationRequest | undefined;
    get targetDailyDose(): number[] | undefined;
    constructor(input: FHIRResourceInput & {
        readonly code?: FHIRCodeableConcept;
        readonly form?: FHIRCodeableConcept;
        readonly ingredient?: FHIRMedicationIngredient[];
    });
}
