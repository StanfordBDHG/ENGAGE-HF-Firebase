import { z } from 'zod';
import { type LocalizedText } from './localizedText.js';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare const videoConverter: Lazy<SchemaConverter<z.ZodEffects<z.ZodObject<{
    title: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>, LocalizedText, string | Record<string, string>>;
    youtubeId: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>, LocalizedText, string | Record<string, string>>;
    orderIndex: z.ZodNumber;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: LocalizedText;
    description: string;
    youtubeId: LocalizedText;
    orderIndex: number;
}, {
    title: string | Record<string, string>;
    description: string;
    youtubeId: string | Record<string, string>;
    orderIndex: number;
}>, Video, {
    title: string | Record<string, string>;
    description: string;
    youtubeId: string | Record<string, string>;
    orderIndex: number;
}>>>;
export declare class Video {
    readonly title: LocalizedText;
    readonly youtubeId: LocalizedText;
    readonly orderIndex: number;
    readonly description: string;
    constructor(input: {
        title: LocalizedText;
        youtubeId: LocalizedText;
        orderIndex: number;
        description: string;
    });
}
