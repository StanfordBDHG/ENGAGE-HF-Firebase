import { z } from 'zod';
import { FHIRResource, type FHIRResourceInput } from './baseTypes/fhirElement.js';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare enum FHIRAppointmentStatus {
    proposed = "proposed",
    pending = "pending",
    booked = "booked",
    arrived = "arrived",
    fulfilled = "fulfilled",
    cancelled = "cancelled",
    noshow = "noshow",
    enterdInError = "entered-in-error",
    checkedIn = "checked-in",
    waitlist = "waitlist"
}
export declare const fhirAppointmentParticipantConverter: Lazy<SchemaConverter<z.ZodObject<{
    actor: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
    }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    type: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
    type?: {
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
    actor?: {
        reference: string;
        type?: string | undefined;
        display?: string | undefined;
        identifier?: string | undefined;
    } | undefined;
}, {
    type?: {
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
    actor?: {
        reference: string;
        type?: string | null | undefined;
        display?: string | null | undefined;
        identifier?: string | null | undefined;
    } | null | undefined;
}>>>;
export type FHIRAppointmentParticipant = z.output<typeof fhirAppointmentParticipantConverter.value.schema>;
export declare const fhirAppointmentConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    extension: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodType<import("./baseTypes/fhirElement.js").FHIRExtension, z.ZodTypeDef, import("./baseTypes/fhirElement.js").FHIRExtensionInput>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, {
    resourceType: z.ZodString;
}>, {
    status: z.ZodNativeEnum<typeof FHIRAppointmentStatus>;
    created: z.ZodEffects<z.ZodString, Date, string>;
    start: z.ZodEffects<z.ZodString, Date, string>;
    end: z.ZodEffects<z.ZodString, Date, string>;
    comment: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    patientInstruction: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    participant: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodObject<{
        actor: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
        }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        type: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
        type?: {
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
        actor?: {
            reference: string;
            type?: string | undefined;
            display?: string | undefined;
            identifier?: string | undefined;
        } | undefined;
    }, {
        type?: {
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
        actor?: {
            reference: string;
            type?: string | null | undefined;
            display?: string | null | undefined;
            identifier?: string | null | undefined;
        } | null | undefined;
    }>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}>, "strip", z.ZodTypeAny, {
    status: FHIRAppointmentStatus;
    resourceType: string;
    created: Date;
    start: Date;
    end: Date;
    id?: string | undefined;
    extension?: import("./baseTypes/fhirElement.js").FHIRExtension[] | undefined;
    patientInstruction?: string | undefined;
    comment?: string | undefined;
    participant?: {
        type?: {
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
        actor?: {
            reference: string;
            type?: string | undefined;
            display?: string | undefined;
            identifier?: string | undefined;
        } | undefined;
    }[] | undefined;
}, {
    status: FHIRAppointmentStatus;
    resourceType: string;
    created: string;
    start: string;
    end: string;
    id?: string | null | undefined;
    extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
    patientInstruction?: string | null | undefined;
    comment?: string | null | undefined;
    participant?: {
        type?: {
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
        actor?: {
            reference: string;
            type?: string | null | undefined;
            display?: string | null | undefined;
            identifier?: string | null | undefined;
        } | null | undefined;
    }[] | null | undefined;
}>, FHIRAppointment, {
    status: FHIRAppointmentStatus;
    resourceType: string;
    created: string;
    start: string;
    end: string;
    id?: string | null | undefined;
    extension?: import("./baseTypes/fhirElement.js").FHIRExtensionInput[] | null | undefined;
    patientInstruction?: string | null | undefined;
    comment?: string | null | undefined;
    participant?: {
        type?: {
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
        actor?: {
            reference: string;
            type?: string | null | undefined;
            display?: string | null | undefined;
            identifier?: string | null | undefined;
        } | null | undefined;
    }[] | null | undefined;
}>>>;
export declare class FHIRAppointment extends FHIRResource {
    static create(input: {
        userId: string;
        created: Date;
        status: FHIRAppointmentStatus;
        start: Date;
        durationInMinutes: number;
    }): FHIRAppointment;
    readonly resourceType: string;
    readonly status: FHIRAppointmentStatus;
    readonly created: Date;
    readonly start: Date;
    readonly end: Date;
    readonly comment?: string;
    readonly patientInstruction?: string;
    readonly participant?: FHIRAppointmentParticipant[];
    constructor(input: FHIRResourceInput & {
        status: FHIRAppointmentStatus;
        created: Date;
        start: Date;
        end: Date;
        comment?: string;
        patientInstruction?: string;
        participant?: FHIRAppointmentParticipant[];
    });
}
