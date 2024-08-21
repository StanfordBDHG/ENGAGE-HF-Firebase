import { z } from 'zod';
import { type UserAuth } from './userAuth.js';
import { type UserRegistration } from './userRegistration.js';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare const invitationConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<{
    userId: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    code: z.ZodString;
    auth: z.ZodOptional<z.ZodUnion<[z.ZodLazy<z.ZodEffects<z.ZodObject<{
        email: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        displayName: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        phoneNumber: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        photoURL: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        displayName?: string | undefined;
        phoneNumber?: string | undefined;
        photoURL?: string | undefined;
    }, {
        email?: string | null | undefined;
        displayName?: string | null | undefined;
        phoneNumber?: string | null | undefined;
        photoURL?: string | null | undefined;
    }>, UserAuth, {
        email?: string | null | undefined;
        displayName?: string | null | undefined;
        phoneNumber?: string | null | undefined;
        photoURL?: string | null | undefined;
    }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    user: z.ZodLazy<z.ZodEffects<z.ZodObject<{
        type: z.ZodNativeEnum<typeof import("./userType.js").UserType>;
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
        }>, import("./userMessagesSettings.js").UserMessagesSettings, {
            dailyRemindersAreActive?: boolean | null | undefined;
            textNotificationsAreActive?: boolean | null | undefined;
            medicationRemindersAreActive?: boolean | null | undefined;
        }>>, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        language: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
        timeZone: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    }, "strip", z.ZodTypeAny, {
        type: import("./userType.js").UserType;
        language?: string | undefined;
        clinician?: string | undefined;
        organization?: string | undefined;
        dateOfBirth?: Date | undefined;
        messagesSettings?: import("./userMessagesSettings.js").UserMessagesSettings | undefined;
        timeZone?: string | undefined;
    }, {
        type: import("./userType.js").UserType;
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
    }>, UserRegistration, {
        type: import("./userType.js").UserType;
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
    }>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    user: UserRegistration;
    userId?: string | undefined;
    auth?: UserAuth | undefined;
}, {
    code: string;
    user: {
        type: import("./userType.js").UserType;
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
    };
    userId?: string | null | undefined;
    auth?: {
        email?: string | null | undefined;
        displayName?: string | null | undefined;
        phoneNumber?: string | null | undefined;
        photoURL?: string | null | undefined;
    } | null | undefined;
}>, Invitation, {
    code: string;
    user: {
        type: import("./userType.js").UserType;
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
    };
    userId?: string | null | undefined;
    auth?: {
        email?: string | null | undefined;
        displayName?: string | null | undefined;
        phoneNumber?: string | null | undefined;
        photoURL?: string | null | undefined;
    } | null | undefined;
}>>>;
export declare class Invitation {
    readonly userId?: string;
    readonly code: string;
    readonly auth?: UserAuth;
    readonly user: UserRegistration;
    constructor(input: {
        userId?: string;
        code: string;
        auth?: UserAuth;
        user: UserRegistration;
    });
}
