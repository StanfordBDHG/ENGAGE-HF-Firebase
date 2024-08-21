import { z } from 'zod';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export declare const localizedTextConverter: SchemaConverter<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>, LocalizedText, string | Record<string, string>>>;
export declare class LocalizedText {
    readonly content: string | Record<string, string>;
    constructor(input: string | Record<string, string>);
    localize(...languages: string[]): string;
}
