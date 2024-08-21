import { z } from 'zod';
import { LocalizedText } from './localizedText.js';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
import { QuestionnaireReference, VideoReference } from '../codes/references.js';
export declare enum UserMessageType {
    medicationChange = "MedicationChange",
    weightGain = "WeightGain",
    medicationUptitration = "MedicationUptitration",
    welcome = "Welcome",
    vitals = "Vitals",
    symptomQuestionnaire = "SymptomQuestionnaire",
    preAppointment = "PreAppointment"
}
export declare const userMessageConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<{
    creationDate: z.ZodEffects<z.ZodString, Date, string>;
    dueDate: z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    completionDate: z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    type: z.ZodNativeEnum<typeof UserMessageType>;
    title: z.ZodLazy<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>, LocalizedText, string | Record<string, string>>>;
    description: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>, LocalizedText, string | Record<string, string>>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    action: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    isDismissible: z.ZodBoolean;
    reference: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, "strip", z.ZodTypeAny, {
    type: UserMessageType;
    creationDate: Date;
    title: LocalizedText;
    isDismissible: boolean;
    dueDate?: Date | undefined;
    completionDate?: Date | undefined;
    description?: LocalizedText | undefined;
    action?: string | undefined;
    reference?: string | undefined;
}, {
    type: UserMessageType;
    creationDate: string;
    title: string | Record<string, string>;
    isDismissible: boolean;
    dueDate?: string | null | undefined;
    completionDate?: string | null | undefined;
    description?: string | Record<string, string> | null | undefined;
    action?: string | null | undefined;
    reference?: string | null | undefined;
}>, UserMessage, {
    type: UserMessageType;
    creationDate: string;
    title: string | Record<string, string>;
    isDismissible: boolean;
    dueDate?: string | null | undefined;
    completionDate?: string | null | undefined;
    description?: string | Record<string, string> | null | undefined;
    action?: string | null | undefined;
    reference?: string | null | undefined;
}>>>;
export declare class UserMessage {
    static createMedicationChange(input: {
        creationDate?: Date;
        reference: string;
        medicationName: string;
        videoReference?: string;
    }): UserMessage;
    static createMedicationUptitration(input?: {
        creationDate?: Date;
    }): UserMessage;
    static createPreAppointment(input?: {
        creationDate?: Date;
        reference?: string;
    }): UserMessage;
    static createSymptomQuestionnaire(input: {
        creationDate?: Date;
        questionnaireReference: QuestionnaireReference;
    }): UserMessage;
    static createVitals(input?: {
        creationDate?: Date;
    }): UserMessage;
    static createWeightGain(input?: {
        creationDate?: Date;
    }): UserMessage;
    static createWelcome(input: {
        creationDate?: Date;
        videoReference: VideoReference;
    }): UserMessage;
    readonly creationDate: Date;
    readonly dueDate?: Date;
    readonly completionDate?: Date;
    readonly type: UserMessageType;
    readonly title: LocalizedText;
    readonly description?: LocalizedText;
    readonly action?: string;
    readonly isDismissible: boolean;
    readonly reference?: string;
    constructor(input: {
        creationDate: Date;
        dueDate?: Date;
        completionDate?: Date;
        type: UserMessageType;
        title: LocalizedText;
        description?: LocalizedText;
        action?: string;
        isDismissible: boolean;
        reference?: string;
    });
}
