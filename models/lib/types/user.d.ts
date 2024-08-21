import { z } from 'zod';
import { type UserMessagesSettings } from './userMessagesSettings.js';
import { UserRegistration } from './userRegistration.js';
import { type UserType } from './userType.js';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare const userConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<z.objectUtil.extendShape<{
    type: z.ZodNativeEnum<typeof UserType>;
    organization: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    dateOfBirth: z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    clinician: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    messagesSettings: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodEffects<z.ZodObject<{
        dailyRemindersAreActive: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        textNotificationsAreActive: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        medicationRemindersAreActive: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    }, "strip", z.ZodTypeAny, {
        dailyRemindersAreActive?: boolean | undefined;
        textNotificationsAreActive?: boolean | undefined;
        medicationRemindersAreActive?: boolean | undefined;
    }, {
        dailyRemindersAreActive?: boolean | null | undefined;
        textNotificationsAreActive?: boolean | null | undefined;
        medicationRemindersAreActive?: boolean | null | undefined;
    }>, UserMessagesSettings, {
        dailyRemindersAreActive?: boolean | null | undefined;
        textNotificationsAreActive?: boolean | null | undefined;
        medicationRemindersAreActive?: boolean | null | undefined;
    }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    language: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    timeZone: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, {
    dateOfEnrollment: z.ZodEffects<z.ZodString, Date, string>;
    invitationCode: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    type: UserType;
    dateOfEnrollment: Date;
    invitationCode: string;
    language?: string | undefined;
    clinician?: string | undefined;
    organization?: string | undefined;
    dateOfBirth?: Date | undefined;
    messagesSettings?: UserMessagesSettings | undefined;
    timeZone?: string | undefined;
}, {
    type: UserType;
    dateOfEnrollment: string;
    invitationCode: string;
    language?: string | null | undefined;
    clinician?: string | null | undefined;
    organization?: string | null | undefined;
    dateOfBirth?: string | null | undefined;
    messagesSettings?: {
        dailyRemindersAreActive?: boolean | null | undefined;
        textNotificationsAreActive?: boolean | null | undefined;
        medicationRemindersAreActive?: boolean | null | undefined;
    } | null | undefined;
    timeZone?: string | null | undefined;
}>, User, {
    type: UserType;
    dateOfEnrollment: string;
    invitationCode: string;
    language?: string | null | undefined;
    clinician?: string | null | undefined;
    organization?: string | null | undefined;
    dateOfBirth?: string | null | undefined;
    messagesSettings?: {
        dailyRemindersAreActive?: boolean | null | undefined;
        textNotificationsAreActive?: boolean | null | undefined;
        medicationRemindersAreActive?: boolean | null | undefined;
    } | null | undefined;
    timeZone?: string | null | undefined;
}>>>;
export declare class User extends UserRegistration {
    readonly dateOfEnrollment: Date;
    readonly invitationCode: string;
    constructor(input: {
        type: UserType;
        organization?: string;
        dateOfBirth?: Date;
        clinician?: string;
        messagesSettings?: UserMessagesSettings;
        language?: string;
        timeZone?: string;
        dateOfEnrollment: Date;
        invitationCode: string;
    });
}
