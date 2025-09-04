//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type FHIRResource,
  type FHIRSchemaConverter,
  type SchemaConverter,
} from "@stanfordbdhg/engagehf-models";
import { type DomainResource } from "fhir/r4b";
import {
  type DocumentData,
  type DocumentSnapshot,
  type FirestoreDataConverter,
} from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { type ZodType, type z } from "zod";

export class DatabaseConverter<Schema extends ZodType, Encoded>
  implements FirestoreDataConverter<z.output<Schema>>
{
  // Properties

  private readonly converter: SchemaConverter<Schema, Encoded>;

  // Constructor

  constructor(converter: SchemaConverter<Schema, Encoded>) {
    this.converter = converter;
  }

  // Methods

  fromFirestore(snapshot: DocumentSnapshot): z.output<Schema> {
    const data = snapshot.data();
    try {
      return this.converter.schema.parse(data);
    } catch (error) {
      logger.error(
        `DatabaseDecoder: Failed to decode object ${JSON.stringify(data)} due to ${String(error)}.`,
      );
      throw error;
    }
  }

  toFirestore(modelObject: z.output<Schema>): DocumentData {
    try {
      return this.converter.encode(modelObject) as DocumentData;
    } catch (error) {
      logger.error(
        `DatabaseDecoder(${typeof modelObject}): Failed to encode object ${JSON.stringify(modelObject)} due to ${String(error)}.`,
      );
      throw error;
    }
  }
}

export class FHIRDatabaseConverter<
  C extends FHIRSchemaConverter<FHIRResource<DomainResource>>,
> implements FirestoreDataConverter<z.output<C["schema"]>>
{
  // Properties

  private readonly converter: C;

  // Constructor

  constructor(converter: C) {
    this.converter = converter;
  }

  // Methods

  fromFirestore(snapshot: DocumentSnapshot): z.output<C["schema"]> {
    const data = snapshot.data();
    try {
      return this.converter.schema.parse(data) as z.output<C["schema"]>;
    } catch (error) {
      logger.error(
        `DatabaseDecoder: Failed to decode object ${JSON.stringify(data)} due to ${String(error)}.`,
      );
      throw error;
    }
  }

  toFirestore(modelObject: z.output<C["schema"]>): DocumentData {
    try {
      return this.converter.encode(modelObject) as DocumentData;
    } catch (error) {
      logger.error(
        `DatabaseDecoder(${typeof modelObject}): Failed to encode object ${JSON.stringify(modelObject)} due to ${String(error)}.`,
      );
      throw error;
    }
  }
}
