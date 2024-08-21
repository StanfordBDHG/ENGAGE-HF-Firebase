import { type DocumentSnapshot, type DocumentData, type FirestoreDataConverter } from 'firebase-admin/firestore';
import { type z } from 'zod';
export declare class SchemaConverter<Schema extends z.ZodType<any, any, any>> implements FirestoreDataConverter<z.output<Schema>> {
    readonly schema: Schema;
    readonly encode: (value: z.output<Schema>) => z.input<Schema>;
    get value(): this;
    constructor(input: {
        schema: Schema;
        encode: (value: z.output<Schema>) => z.input<Schema>;
    });
    fromFirestore(snapshot: DocumentSnapshot): z.output<Schema>;
    toFirestore(modelObject: z.output<Schema>): DocumentData;
}
