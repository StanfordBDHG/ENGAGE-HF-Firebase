import { z } from 'zod';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare const userAuthConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<{
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
}>>>;
export declare class UserAuth {
    readonly email?: string;
    readonly displayName?: string;
    readonly phoneNumber?: string;
    readonly photoURL?: string;
    constructor(input: {
        email?: string;
        displayName?: string;
        phoneNumber?: string;
        photoURL?: string;
    });
}
