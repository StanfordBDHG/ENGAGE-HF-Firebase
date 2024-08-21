import { z } from 'zod';
import { type LocalizedText } from './localizedText.js';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare const medicationClassConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<{
    name: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>, LocalizedText, string | Record<string, string>>;
    videoPath: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: LocalizedText;
    videoPath: string;
}, {
    name: string | Record<string, string>;
    videoPath: string;
}>, MedicationClass, {
    name: string | Record<string, string>;
    videoPath: string;
}>>>;
export declare class MedicationClass {
    readonly name: LocalizedText;
    readonly videoPath: string;
    constructor(input: {
        name: LocalizedText;
        videoPath: string;
    });
}
