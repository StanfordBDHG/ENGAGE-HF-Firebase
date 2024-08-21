import { z } from 'zod';
import { SchemaConverter } from './schemaConverter.js';
export declare const dateConverter: SchemaConverter<z.ZodEffects<z.ZodString, Date, string>>;
