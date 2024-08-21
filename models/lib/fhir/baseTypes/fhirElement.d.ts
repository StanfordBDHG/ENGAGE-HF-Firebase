import { z } from 'zod';
import { type FHIRCodeableConcept } from './fhirCodeableConcept.js';
import { type FHIRCoding } from './fhirCoding.js';
import { type FHIRDosage } from './fhirDosage.js';
import { type FHIRReference } from './fhirReference.js';
import { type FHIRExtensionUrl } from '../../codes/codes.js';
import { type DrugReference } from '../../codes/references.js';
import { SchemaConverter } from '../../helpers/schemaConverter.js';
declare const fhirExtensionBaseConverter: SchemaConverter<z.ZodObject<{
    url: z.ZodString;
    valueQuantities: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodObject<{
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
    }>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    valueReference: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    url: string;
    valueQuantities?: {
        value?: number | undefined;
        code?: string | undefined;
        system?: string | undefined;
        unit?: string | undefined;
    }[] | undefined;
    valueReference?: {
        reference: string;
        type?: string | undefined;
        display?: string | undefined;
        identifier?: string | undefined;
    } | undefined;
}, {
    url: string;
    valueQuantities?: {
        value?: number | null | undefined;
        code?: string | null | undefined;
        system?: string | null | undefined;
        unit?: string | null | undefined;
    }[] | null | undefined;
    valueReference?: {
        reference: string;
        type?: string | null | undefined;
        display?: string | null | undefined;
        identifier?: string | null | undefined;
    } | null | undefined;
}>>;
export interface FHIRExtensionInput extends z.input<typeof fhirExtensionBaseConverter.value.schema> {
    valueMedicationRequest?: z.input<typeof fhirMedicationRequestConverter.value.schema> | null | undefined;
}
export interface FHIRExtension extends z.output<typeof fhirExtensionBaseConverter.value.schema> {
    valueMedicationRequest?: FHIRMedicationRequest;
}
export declare const fhirExtensionConverter: SchemaConverter<z.ZodType<FHIRExtension, z.ZodTypeDef, FHIRExtensionInput>>;
export declare const fhirElementConverter: SchemaConverter<z.ZodObject<{
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    extension: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodType<FHIRExtension, z.ZodTypeDef, FHIRExtensionInput>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, "strip", z.ZodTypeAny, {
    id?: string | undefined;
    extension?: FHIRExtension[] | undefined;
}, {
    id?: string | null | undefined;
    extension?: FHIRExtensionInput[] | null | undefined;
}>>;
export declare abstract class FHIRElement {
    readonly id?: string;
    readonly extension?: FHIRExtension[];
    constructor(input: {
        id?: string;
        extension?: FHIRExtension[];
    });
    extensionsWithUrl(url: FHIRExtensionUrl): FHIRExtension[];
}
export declare const fhirResourceConverter: SchemaConverter<z.ZodObject<z.objectUtil.extendShape<{
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    extension: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodType<FHIRExtension, z.ZodTypeDef, FHIRExtensionInput>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, {
    resourceType: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    resourceType: string;
    id?: string | undefined;
    extension?: FHIRExtension[] | undefined;
}, {
    resourceType: string;
    id?: string | null | undefined;
    extension?: FHIRExtensionInput[] | null | undefined;
}>>;
export type FHIRResourceInput = z.output<typeof fhirElementConverter.value.schema>;
export declare abstract class FHIRResource extends FHIRElement {
    abstract get resourceType(): string;
    codes(concept: FHIRCodeableConcept | undefined, filter: FHIRCoding): string[];
    containsCoding(concept: FHIRCodeableConcept | undefined, filter: FHIRCoding[]): boolean;
}
export declare const fhirMedicationRequestConverter: SchemaConverter<z.ZodEffects<z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    extension: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodType<FHIRExtension, z.ZodTypeDef, FHIRExtensionInput>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, {
    resourceType: z.ZodString;
}>, {
    medicationReference: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
    dosageInstruction: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodObject<{
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
                    extension: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodType<FHIRExtension, z.ZodTypeDef, FHIRExtensionInput>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
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
                    extension?: FHIRExtension[] | undefined;
                    version?: string | undefined;
                    userSelected?: boolean | undefined;
                }, {
                    code?: string | null | undefined;
                    system?: string | null | undefined;
                    display?: string | null | undefined;
                    id?: string | null | undefined;
                    extension?: FHIRExtensionInput[] | null | undefined;
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
                    extension?: FHIRExtension[] | undefined;
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
                    extension?: FHIRExtensionInput[] | null | undefined;
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
                    extension?: FHIRExtension[] | undefined;
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
                    extension?: FHIRExtensionInput[] | null | undefined;
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
                    extension: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodLazy<z.ZodType<FHIRExtension, z.ZodTypeDef, FHIRExtensionInput>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
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
                    extension?: FHIRExtension[] | undefined;
                    version?: string | undefined;
                    userSelected?: boolean | undefined;
                }, {
                    code?: string | null | undefined;
                    system?: string | null | undefined;
                    display?: string | null | undefined;
                    id?: string | null | undefined;
                    extension?: FHIRExtensionInput[] | null | undefined;
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
                    extension?: FHIRExtension[] | undefined;
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
                    extension?: FHIRExtensionInput[] | null | undefined;
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
                    extension?: FHIRExtension[] | undefined;
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
                    extension?: FHIRExtensionInput[] | null | undefined;
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
                    extension?: FHIRExtension[] | undefined;
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
                    extension?: FHIRExtension[] | undefined;
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
                    extension?: FHIRExtensionInput[] | null | undefined;
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
                    extension?: FHIRExtensionInput[] | null | undefined;
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
    }>>, "many">, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}>, "strip", z.ZodTypeAny, {
    resourceType: string;
    id?: string | undefined;
    extension?: FHIRExtension[] | undefined;
    medicationReference?: {
        reference: string;
        type?: string | undefined;
        display?: string | undefined;
        identifier?: string | undefined;
    } | undefined;
    dosageInstruction?: {
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
                    extension?: FHIRExtension[] | undefined;
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
                    extension?: FHIRExtension[] | undefined;
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
    }[] | undefined;
}, {
    resourceType: string;
    id?: string | null | undefined;
    extension?: FHIRExtensionInput[] | null | undefined;
    medicationReference?: {
        reference: string;
        type?: string | null | undefined;
        display?: string | null | undefined;
        identifier?: string | null | undefined;
    } | null | undefined;
    dosageInstruction?: {
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
                    extension?: FHIRExtensionInput[] | null | undefined;
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
                    extension?: FHIRExtensionInput[] | null | undefined;
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
    }[] | null | undefined;
}>, FHIRMedicationRequest, {
    resourceType: string;
    id?: string | null | undefined;
    extension?: FHIRExtensionInput[] | null | undefined;
    medicationReference?: {
        reference: string;
        type?: string | null | undefined;
        display?: string | null | undefined;
        identifier?: string | null | undefined;
    } | null | undefined;
    dosageInstruction?: {
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
                    extension?: FHIRExtensionInput[] | null | undefined;
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
                    extension?: FHIRExtensionInput[] | null | undefined;
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
    }[] | null | undefined;
}>>;
export declare class FHIRMedicationRequest extends FHIRResource {
    static create(input: {
        drugReference: DrugReference;
        frequencyPerDay: number;
        quantity: number;
    }): FHIRMedicationRequest;
    readonly resourceType: string;
    readonly medicationReference?: FHIRReference;
    readonly dosageInstruction?: FHIRDosage[];
    constructor(input: FHIRResourceInput & {
        medicationReference?: FHIRReference;
        dosageInstruction?: FHIRDosage[];
    });
}
export {};
