import { z } from 'zod';
import { type FHIRCodeableConcept } from './baseTypes/fhirCodeableConcept.js';
import { type FHIRCoding } from './baseTypes/fhirCoding.js';
import { FHIRResource, type FHIRResourceInput } from './baseTypes/fhirElement.js';
import { type FHIRPeriod } from './baseTypes/fhirPeriod.js';
import { type FHIRQuantity } from './baseTypes/fhirQuantity.js';
import { LoincCode } from '../codes/codes.js';
import { Lazy } from '../helpers/lazy.js';
import { Observation } from '../types/observation.js';
import { QuantityUnit } from '../codes/quantityUnit.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare enum FHIRObservationStatus {
    registered = "registered",
    preliminary = "preliminary",
    final = "final",
    amended = "amended",
    corrected = "corrected",
    cancelled = "cancelled",
    entered_in_error = "entered-in-error",
    unknown = "unknown"
}
export declare const fhirObservationComponentConverter: Lazy<SchemaConverter<z.ZodObject<{
    code: z.ZodLazy<z.ZodObject<{
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
        }>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        text: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    }, "strip", z.ZodTypeAny, {
        coding?: {
            code?: string | undefined;
            id?: string | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
            system?: string | undefined;
            display?: string | undefined;
            version?: string | undefined;
            userSelected?: boolean | undefined;
        }[] | undefined;
        text?: string | undefined;
    }, {
        coding?: {
            code?: string | null | undefined;
            id?: string | null | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
            system?: string | null | undefined;
            display?: string | null | undefined;
            version?: string | null | undefined;
            userSelected?: boolean | null | undefined;
        }[] | null | undefined;
        text?: string | null | undefined;
    }>>;
    valueQuantity: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
    code: {
        coding?: {
            code?: string | undefined;
            id?: string | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
            system?: string | undefined;
            display?: string | undefined;
            version?: string | undefined;
            userSelected?: boolean | undefined;
        }[] | undefined;
        text?: string | undefined;
    };
    valueQuantity?: {
        value?: number | undefined;
        code?: string | undefined;
        system?: string | undefined;
        unit?: string | undefined;
    } | undefined;
}, {
    code: {
        coding?: {
            code?: string | null | undefined;
            id?: string | null | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
            system?: string | null | undefined;
            display?: string | null | undefined;
            version?: string | null | undefined;
            userSelected?: boolean | null | undefined;
        }[] | null | undefined;
        text?: string | null | undefined;
    };
    valueQuantity?: {
        value?: number | null | undefined;
        code?: string | null | undefined;
        system?: string | null | undefined;
        unit?: string | null | undefined;
    } | null | undefined;
}>>>;
export type FHIRObservationComponent = z.output<typeof fhirObservationComponentConverter.value.schema>;
export declare const fhirObservationConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    extension: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodType<import("./baseTypes/fhirElement.js").FHIRExtension, z.ZodTypeDef, import("./baseTypes/fhirElement.js").FHIRExtensionInput>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, {
    resourceType: z.ZodString;
}>, {
    status: z.ZodNativeEnum<typeof FHIRObservationStatus>;
    code: z.ZodLazy<z.ZodObject<{
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
        }>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        text: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    }, "strip", z.ZodTypeAny, {
        coding?: {
            code?: string | undefined;
            id?: string | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
            system?: string | undefined;
            display?: string | undefined;
            version?: string | undefined;
            userSelected?: boolean | undefined;
        }[] | undefined;
        text?: string | undefined;
    }, {
        coding?: {
            code?: string | null | undefined;
            id?: string | null | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
            system?: string | null | undefined;
            display?: string | null | undefined;
            version?: string | null | undefined;
            userSelected?: boolean | null | undefined;
        }[] | null | undefined;
        text?: string | null | undefined;
    }>>;
    component: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodObject<{
        code: z.ZodLazy<z.ZodObject<{
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
            }>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
            text: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        }, "strip", z.ZodTypeAny, {
            coding?: {
                code?: string | undefined;
                id?: string | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
                system?: string | undefined;
                display?: string | undefined;
                version?: string | undefined;
                userSelected?: boolean | undefined;
            }[] | undefined;
            text?: string | undefined;
        }, {
            coding?: {
                code?: string | null | undefined;
                id?: string | null | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
                system?: string | null | undefined;
                display?: string | null | undefined;
                version?: string | null | undefined;
                userSelected?: boolean | null | undefined;
            }[] | null | undefined;
            text?: string | null | undefined;
        }>>;
        valueQuantity: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
        code: {
            coding?: {
                code?: string | undefined;
                id?: string | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
                system?: string | undefined;
                display?: string | undefined;
                version?: string | undefined;
                userSelected?: boolean | undefined;
            }[] | undefined;
            text?: string | undefined;
        };
        valueQuantity?: {
            value?: number | undefined;
            code?: string | undefined;
            system?: string | undefined;
            unit?: string | undefined;
        } | undefined;
    }, {
        code: {
            coding?: {
                code?: string | null | undefined;
                id?: string | null | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
                system?: string | null | undefined;
                display?: string | null | undefined;
                version?: string | null | undefined;
                userSelected?: boolean | null | undefined;
            }[] | null | undefined;
            text?: string | null | undefined;
        };
        valueQuantity?: {
            value?: number | null | undefined;
            code?: string | null | undefined;
            system?: string | null | undefined;
            unit?: string | null | undefined;
        } | null | undefined;
    }>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    valueQuantity: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
    effectivePeriod: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
        start: z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        end: z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    }, "strip", z.ZodTypeAny, {
        start?: Date | undefined;
        end?: Date | undefined;
    }, {
        start?: string | null | undefined;
        end?: string | null | undefined;
    }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    effectiveDateTime: z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    effectiveInstant: z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}>, "strip", z.ZodTypeAny, {
    status: FHIRObservationStatus;
    code: {
        coding?: {
            code?: string | undefined;
            id?: string | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
            system?: string | undefined;
            display?: string | undefined;
            version?: string | undefined;
            userSelected?: boolean | undefined;
        }[] | undefined;
        text?: string | undefined;
    };
    resourceType: string;
    id?: string | undefined;
    extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
    valueQuantity?: {
        value?: number | undefined;
        code?: string | undefined;
        system?: string | undefined;
        unit?: string | undefined;
    } | undefined;
    component?: {
        code: {
            coding?: {
                code?: string | undefined;
                id?: string | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
                system?: string | undefined;
                display?: string | undefined;
                version?: string | undefined;
                userSelected?: boolean | undefined;
            }[] | undefined;
            text?: string | undefined;
        };
        valueQuantity?: {
            value?: number | undefined;
            code?: string | undefined;
            system?: string | undefined;
            unit?: string | undefined;
        } | undefined;
    }[] | undefined;
    effectivePeriod?: {
        start?: Date | undefined;
        end?: Date | undefined;
    } | undefined;
    effectiveDateTime?: Date | undefined;
    effectiveInstant?: Date | undefined;
}, {
    status: FHIRObservationStatus;
    code: {
        coding?: {
            code?: string | null | undefined;
            id?: string | null | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
            system?: string | null | undefined;
            display?: string | null | undefined;
            version?: string | null | undefined;
            userSelected?: boolean | null | undefined;
        }[] | null | undefined;
        text?: string | null | undefined;
    };
    resourceType: string;
    id?: string | null | undefined;
    extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
    valueQuantity?: {
        value?: number | null | undefined;
        code?: string | null | undefined;
        system?: string | null | undefined;
        unit?: string | null | undefined;
    } | null | undefined;
    component?: {
        code: {
            coding?: {
                code?: string | null | undefined;
                id?: string | null | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
                system?: string | null | undefined;
                display?: string | null | undefined;
                version?: string | null | undefined;
                userSelected?: boolean | null | undefined;
            }[] | null | undefined;
            text?: string | null | undefined;
        };
        valueQuantity?: {
            value?: number | null | undefined;
            code?: string | null | undefined;
            system?: string | null | undefined;
            unit?: string | null | undefined;
        } | null | undefined;
    }[] | null | undefined;
    effectivePeriod?: {
        start?: string | null | undefined;
        end?: string | null | undefined;
    } | null | undefined;
    effectiveDateTime?: string | null | undefined;
    effectiveInstant?: string | null | undefined;
}>, FHIRObservation, {
    status: FHIRObservationStatus;
    code: {
        coding?: {
            code?: string | null | undefined;
            id?: string | null | undefined;
            extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
            system?: string | null | undefined;
            display?: string | null | undefined;
            version?: string | null | undefined;
            userSelected?: boolean | null | undefined;
        }[] | null | undefined;
        text?: string | null | undefined;
    };
    resourceType: string;
    id?: string | null | undefined;
    extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
    valueQuantity?: {
        value?: number | null | undefined;
        code?: string | null | undefined;
        system?: string | null | undefined;
        unit?: string | null | undefined;
    } | null | undefined;
    component?: {
        code: {
            coding?: {
                code?: string | null | undefined;
                id?: string | null | undefined;
                extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
                system?: string | null | undefined;
                display?: string | null | undefined;
                version?: string | null | undefined;
                userSelected?: boolean | null | undefined;
            }[] | null | undefined;
            text?: string | null | undefined;
        };
        valueQuantity?: {
            value?: number | null | undefined;
            code?: string | null | undefined;
            system?: string | null | undefined;
            unit?: string | null | undefined;
        } | null | undefined;
    }[] | null | undefined;
    effectivePeriod?: {
        start?: string | null | undefined;
        end?: string | null | undefined;
    } | null | undefined;
    effectiveDateTime?: string | null | undefined;
    effectiveInstant?: string | null | undefined;
}>>>;
export declare class FHIRObservation extends FHIRResource {
    private static readonly loincDisplay;
    static createBloodPressure(input: {
        id: string;
        date: Date;
        systolic: number;
        diastolic: number;
    }): FHIRObservation;
    static createSimple(input: {
        id: string;
        date: Date;
        value: number;
        unit: QuantityUnit;
        code: LoincCode;
    }): FHIRObservation;
    readonly resourceType: string;
    readonly status: FHIRObservationStatus;
    readonly code: FHIRCodeableConcept;
    readonly component?: FHIRObservationComponent[];
    readonly valueQuantity?: FHIRQuantity;
    readonly effectivePeriod?: FHIRPeriod;
    readonly effectiveDateTime?: Date;
    readonly effectiveInstant?: Date;
    constructor(input: FHIRResourceInput & {
        status: FHIRObservationStatus;
        code: FHIRCodeableConcept;
        component?: FHIRObservationComponent[];
        valueQuantity?: FHIRQuantity;
        effectivePeriod?: FHIRPeriod;
        effectiveDateTime?: Date;
        effectiveInstant?: Date;
    });
    observations(options: {
        unit: QuantityUnit;
        component?: FHIRCoding;
    } & FHIRCoding): Observation[];
}
