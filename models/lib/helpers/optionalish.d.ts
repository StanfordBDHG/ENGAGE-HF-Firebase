import { z } from 'zod';
export declare function optionalish<T extends z.ZodType<any, any, any>>(type: T): z.ZodOptional<z.ZodUnion<[T, z.ZodEffects<z.ZodNull, undefined, null>]>>;
