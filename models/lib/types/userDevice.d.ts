import { z } from 'zod';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare enum UserDevicePlatform {
    Android = "Android",
    iOS = "iOS"
}
export declare const userDeviceConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<{
    notificationToken: z.ZodString;
    platform: z.ZodNativeEnum<typeof UserDevicePlatform>;
    osVersion: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    appVersion: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    appBuild: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    language: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
    timeZone: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodEffects<z.ZodNull, undefined, null>]>>;
}, "strip", z.ZodTypeAny, {
    notificationToken: string;
    platform: UserDevicePlatform;
    language?: string | undefined;
    timeZone?: string | undefined;
    osVersion?: string | undefined;
    appVersion?: string | undefined;
    appBuild?: string | undefined;
}, {
    notificationToken: string;
    platform: UserDevicePlatform;
    language?: string | null | undefined;
    timeZone?: string | null | undefined;
    osVersion?: string | null | undefined;
    appVersion?: string | null | undefined;
    appBuild?: string | null | undefined;
}>, UserDevice, {
    notificationToken: string;
    platform: UserDevicePlatform;
    language?: string | null | undefined;
    timeZone?: string | null | undefined;
    osVersion?: string | null | undefined;
    appVersion?: string | null | undefined;
    appBuild?: string | null | undefined;
}>>>;
export declare class UserDevice {
    readonly notificationToken: string;
    readonly platform: UserDevicePlatform;
    readonly osVersion?: string;
    readonly appVersion?: string;
    readonly appBuild?: string;
    readonly language?: string;
    readonly timeZone?: string;
    constructor(input: {
        notificationToken: string;
        platform: UserDevicePlatform;
        osVersion?: string;
        appVersion?: string;
        appBuild?: string;
        language?: string;
        timeZone?: string;
    });
}
