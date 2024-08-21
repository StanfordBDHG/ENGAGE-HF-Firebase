import { z } from 'zod';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare const userMessagesSettingsConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<{
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
}>>>;
export declare class UserMessagesSettings {
    readonly dailyRemindersAreActive?: boolean;
    readonly textNotificationsAreActive?: boolean;
    readonly medicationRemindersAreActive?: boolean;
    constructor(input: {
        dailyRemindersAreActive?: boolean;
        textNotificationsAreActive?: boolean;
        medicationRemindersAreActive?: boolean;
    });
}
