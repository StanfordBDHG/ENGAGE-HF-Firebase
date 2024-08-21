import { z } from 'zod';
import { type LocalizedText } from './localizedText.js';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare const videoSectionConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<{
    title: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>, LocalizedText, string | Record<string, string>>;
    description: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>, LocalizedText, string | Record<string, string>>;
    orderIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    title: LocalizedText;
    description: LocalizedText;
    orderIndex: number;
}, {
    title: string | Record<string, string>;
    description: string | Record<string, string>;
    orderIndex: number;
}>, VideoSection, {
    title: string | Record<string, string>;
    description: string | Record<string, string>;
    orderIndex: number;
}>>>;
export declare class VideoSection {
    readonly title: LocalizedText;
    readonly description: LocalizedText;
    readonly orderIndex: number;
    constructor(input: {
        title: LocalizedText;
        description: LocalizedText;
        orderIndex: number;
    });
}
