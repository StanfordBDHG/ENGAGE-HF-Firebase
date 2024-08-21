import { z } from 'zod';
import { Lazy } from '../helpers/lazy.js';
import { type FHIRReference } from '../fhir/baseTypes/fhirReference.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare enum UserMedicationRecommendationType {
    improvementAvailable = "improvementAvailable",
    moreLabObservationsRequired = "moreLabObservationsRequired",
    morePatientObservationsRequired = "morePatientObservationsRequired",
    noActionRequired = "noActionRequired",
    notStarted = "notStarted",
    personalTargetDoseReached = "personalTargetDoseReached",
    targetDoseReached = "targetDoseReached"
}
export declare const userMedicationRecommendationDoseScheduleConverter: Lazy<SchemaConverter<z.ZodObject<{
    frequency: z.ZodNumber;
    quantity: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    frequency: number;
    quantity: number[];
}, {
    frequency: number;
    quantity: number[];
}>>>;
export type UserMedicationRecommendationDoseSchedule = z.output<typeof userMedicationRecommendationDoseScheduleConverter.value.schema>;
export declare const userMedicationRecommendationDosageInformationConverter: Lazy<SchemaConverter<z.ZodObject<{
    currentSchedule: z.ZodArray<z.ZodLazy<z.ZodObject<{
        frequency: z.ZodNumber;
        quantity: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        frequency: number;
        quantity: number[];
    }, {
        frequency: number;
        quantity: number[];
    }>>, "many">;
    minimumSchedule: z.ZodArray<z.ZodLazy<z.ZodObject<{
        frequency: z.ZodNumber;
        quantity: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        frequency: number;
        quantity: number[];
    }, {
        frequency: number;
        quantity: number[];
    }>>, "many">;
    targetSchedule: z.ZodArray<z.ZodLazy<z.ZodObject<{
        frequency: z.ZodNumber;
        quantity: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        frequency: number;
        quantity: number[];
    }, {
        frequency: number;
        quantity: number[];
    }>>, "many">;
    unit: z.ZodString;
}, "strip", z.ZodTypeAny, {
    unit: string;
    currentSchedule: {
        frequency: number;
        quantity: number[];
    }[];
    minimumSchedule: {
        frequency: number;
        quantity: number[];
    }[];
    targetSchedule: {
        frequency: number;
        quantity: number[];
    }[];
}, {
    unit: string;
    currentSchedule: {
        frequency: number;
        quantity: number[];
    }[];
    minimumSchedule: {
        frequency: number;
        quantity: number[];
    }[];
    targetSchedule: {
        frequency: number;
        quantity: number[];
    }[];
}>>>;
export declare const userMedicationRecommendationDisplayInformationConverter: Lazy<SchemaConverter<z.ZodObject<{
    title: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>, import("./localizedText.js").LocalizedText, string | Record<string, string>>;
    subtitle: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>, import("./localizedText.js").LocalizedText, string | Record<string, string>>;
    description: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>, import("./localizedText.js").LocalizedText, string | Record<string, string>>;
    type: z.ZodNativeEnum<typeof UserMedicationRecommendationType>;
    videoPath: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    dosageInformation: z.ZodLazy<z.ZodObject<{
        currentSchedule: z.ZodArray<z.ZodLazy<z.ZodObject<{
            frequency: z.ZodNumber;
            quantity: z.ZodArray<z.ZodNumber, "many">;
        }, "strip", z.ZodTypeAny, {
            frequency: number;
            quantity: number[];
        }, {
            frequency: number;
            quantity: number[];
        }>>, "many">;
        minimumSchedule: z.ZodArray<z.ZodLazy<z.ZodObject<{
            frequency: z.ZodNumber;
            quantity: z.ZodArray<z.ZodNumber, "many">;
        }, "strip", z.ZodTypeAny, {
            frequency: number;
            quantity: number[];
        }, {
            frequency: number;
            quantity: number[];
        }>>, "many">;
        targetSchedule: z.ZodArray<z.ZodLazy<z.ZodObject<{
            frequency: z.ZodNumber;
            quantity: z.ZodArray<z.ZodNumber, "many">;
        }, "strip", z.ZodTypeAny, {
            frequency: number;
            quantity: number[];
        }, {
            frequency: number;
            quantity: number[];
        }>>, "many">;
        unit: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        unit: string;
        currentSchedule: {
            frequency: number;
            quantity: number[];
        }[];
        minimumSchedule: {
            frequency: number;
            quantity: number[];
        }[];
        targetSchedule: {
            frequency: number;
            quantity: number[];
        }[];
    }, {
        unit: string;
        currentSchedule: {
            frequency: number;
            quantity: number[];
        }[];
        minimumSchedule: {
            frequency: number;
            quantity: number[];
        }[];
        targetSchedule: {
            frequency: number;
            quantity: number[];
        }[];
    }>>;
}, "strip", z.ZodTypeAny, {
    type: UserMedicationRecommendationType;
    title: import("./localizedText.js").LocalizedText;
    subtitle: import("./localizedText.js").LocalizedText;
    description: import("./localizedText.js").LocalizedText;
    dosageInformation: {
        unit: string;
        currentSchedule: {
            frequency: number;
            quantity: number[];
        }[];
        minimumSchedule: {
            frequency: number;
            quantity: number[];
        }[];
        targetSchedule: {
            frequency: number;
            quantity: number[];
        }[];
    };
    videoPath?: string | undefined;
}, {
    type: UserMedicationRecommendationType;
    title: string | Record<string, string>;
    subtitle: string | Record<string, string>;
    description: string | Record<string, string>;
    dosageInformation: {
        unit: string;
        currentSchedule: {
            frequency: number;
            quantity: number[];
        }[];
        minimumSchedule: {
            frequency: number;
            quantity: number[];
        }[];
        targetSchedule: {
            frequency: number;
            quantity: number[];
        }[];
    };
    videoPath?: string | null | undefined;
}>>>;
export type UserMedicationRecommendationDisplayInformation = z.output<typeof userMedicationRecommendationDisplayInformationConverter.value.schema>;
export declare const userMedicationRecommendationConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<{
    currentMedication: z.ZodArray<z.ZodLazy<z.ZodObject<{
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
    }>>, "many">;
    recommendedMedication: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodObject<{
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
    displayInformation: z.ZodLazy<z.ZodObject<{
        title: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>, import("./localizedText.js").LocalizedText, string | Record<string, string>>;
        subtitle: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>, import("./localizedText.js").LocalizedText, string | Record<string, string>>;
        description: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>, import("./localizedText.js").LocalizedText, string | Record<string, string>>;
        type: z.ZodNativeEnum<typeof UserMedicationRecommendationType>;
        videoPath: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        dosageInformation: z.ZodLazy<z.ZodObject<{
            currentSchedule: z.ZodArray<z.ZodLazy<z.ZodObject<{
                frequency: z.ZodNumber;
                quantity: z.ZodArray<z.ZodNumber, "many">;
            }, "strip", z.ZodTypeAny, {
                frequency: number;
                quantity: number[];
            }, {
                frequency: number;
                quantity: number[];
            }>>, "many">;
            minimumSchedule: z.ZodArray<z.ZodLazy<z.ZodObject<{
                frequency: z.ZodNumber;
                quantity: z.ZodArray<z.ZodNumber, "many">;
            }, "strip", z.ZodTypeAny, {
                frequency: number;
                quantity: number[];
            }, {
                frequency: number;
                quantity: number[];
            }>>, "many">;
            targetSchedule: z.ZodArray<z.ZodLazy<z.ZodObject<{
                frequency: z.ZodNumber;
                quantity: z.ZodArray<z.ZodNumber, "many">;
            }, "strip", z.ZodTypeAny, {
                frequency: number;
                quantity: number[];
            }, {
                frequency: number;
                quantity: number[];
            }>>, "many">;
            unit: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            unit: string;
            currentSchedule: {
                frequency: number;
                quantity: number[];
            }[];
            minimumSchedule: {
                frequency: number;
                quantity: number[];
            }[];
            targetSchedule: {
                frequency: number;
                quantity: number[];
            }[];
        }, {
            unit: string;
            currentSchedule: {
                frequency: number;
                quantity: number[];
            }[];
            minimumSchedule: {
                frequency: number;
                quantity: number[];
            }[];
            targetSchedule: {
                frequency: number;
                quantity: number[];
            }[];
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: UserMedicationRecommendationType;
        title: import("./localizedText.js").LocalizedText;
        subtitle: import("./localizedText.js").LocalizedText;
        description: import("./localizedText.js").LocalizedText;
        dosageInformation: {
            unit: string;
            currentSchedule: {
                frequency: number;
                quantity: number[];
            }[];
            minimumSchedule: {
                frequency: number;
                quantity: number[];
            }[];
            targetSchedule: {
                frequency: number;
                quantity: number[];
            }[];
        };
        videoPath?: string | undefined;
    }, {
        type: UserMedicationRecommendationType;
        title: string | Record<string, string>;
        subtitle: string | Record<string, string>;
        description: string | Record<string, string>;
        dosageInformation: {
            unit: string;
            currentSchedule: {
                frequency: number;
                quantity: number[];
            }[];
            minimumSchedule: {
                frequency: number;
                quantity: number[];
            }[];
            targetSchedule: {
                frequency: number;
                quantity: number[];
            }[];
        };
        videoPath?: string | null | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    currentMedication: {
        reference: string;
        type?: string | undefined;
        display?: string | undefined;
        identifier?: string | undefined;
    }[];
    displayInformation: {
        type: UserMedicationRecommendationType;
        title: import("./localizedText.js").LocalizedText;
        subtitle: import("./localizedText.js").LocalizedText;
        description: import("./localizedText.js").LocalizedText;
        dosageInformation: {
            unit: string;
            currentSchedule: {
                frequency: number;
                quantity: number[];
            }[];
            minimumSchedule: {
                frequency: number;
                quantity: number[];
            }[];
            targetSchedule: {
                frequency: number;
                quantity: number[];
            }[];
        };
        videoPath?: string | undefined;
    };
    recommendedMedication?: {
        reference: string;
        type?: string | undefined;
        display?: string | undefined;
        identifier?: string | undefined;
    } | undefined;
}, {
    currentMedication: {
        reference: string;
        type?: string | null | undefined;
        display?: string | null | undefined;
        identifier?: string | null | undefined;
    }[];
    displayInformation: {
        type: UserMedicationRecommendationType;
        title: string | Record<string, string>;
        subtitle: string | Record<string, string>;
        description: string | Record<string, string>;
        dosageInformation: {
            unit: string;
            currentSchedule: {
                frequency: number;
                quantity: number[];
            }[];
            minimumSchedule: {
                frequency: number;
                quantity: number[];
            }[];
            targetSchedule: {
                frequency: number;
                quantity: number[];
            }[];
        };
        videoPath?: string | null | undefined;
    };
    recommendedMedication?: {
        reference: string;
        type?: string | null | undefined;
        display?: string | null | undefined;
        identifier?: string | null | undefined;
    } | null | undefined;
}>, UserMedicationRecommendation, {
    currentMedication: {
        reference: string;
        type?: string | null | undefined;
        display?: string | null | undefined;
        identifier?: string | null | undefined;
    }[];
    displayInformation: {
        type: UserMedicationRecommendationType;
        title: string | Record<string, string>;
        subtitle: string | Record<string, string>;
        description: string | Record<string, string>;
        dosageInformation: {
            unit: string;
            currentSchedule: {
                frequency: number;
                quantity: number[];
            }[];
            minimumSchedule: {
                frequency: number;
                quantity: number[];
            }[];
            targetSchedule: {
                frequency: number;
                quantity: number[];
            }[];
        };
        videoPath?: string | null | undefined;
    };
    recommendedMedication?: {
        reference: string;
        type?: string | null | undefined;
        display?: string | null | undefined;
        identifier?: string | null | undefined;
    } | null | undefined;
}>>>;
export declare class UserMedicationRecommendation {
    readonly currentMedication: FHIRReference[];
    readonly recommendedMedication?: FHIRReference;
    readonly displayInformation: UserMedicationRecommendationDisplayInformation;
    constructor(input: {
        currentMedication: FHIRReference[];
        recommendedMedication?: FHIRReference;
        displayInformation: UserMedicationRecommendationDisplayInformation;
    });
}
