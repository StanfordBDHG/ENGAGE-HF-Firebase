import { z } from 'zod';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare const organizationConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    contactName: z.ZodString;
    phoneNumber: z.ZodString;
    emailAddress: z.ZodString;
    ssoProviderId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phoneNumber: string;
    name: string;
    contactName: string;
    emailAddress: string;
    ssoProviderId: string;
}, {
    phoneNumber: string;
    name: string;
    contactName: string;
    emailAddress: string;
    ssoProviderId: string;
}>, Organization, {
    phoneNumber: string;
    name: string;
    contactName: string;
    emailAddress: string;
    ssoProviderId: string;
}>>>;
export declare class Organization {
    readonly name: string;
    readonly contactName: string;
    readonly phoneNumber: string;
    readonly emailAddress: string;
    readonly ssoProviderId: string;
    constructor(input: {
        name: string;
        contactName: string;
        phoneNumber: string;
        emailAddress: string;
        ssoProviderId: string;
    });
}
