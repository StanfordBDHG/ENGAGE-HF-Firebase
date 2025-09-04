//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type FhirMedication,
  type FhirMedicationRequest,
  type MedicationClass,
} from "@stanfordbdhg/engagehf-models";
import { type Reference } from "fhir/r4b.js";
import { type MedicationService } from "./medicationService.js";
import { type MedicationRequestContext } from "../../models/medicationRequestContext.js";
import {
  type Document,
  type DatabaseService,
} from "../database/databaseService.js";

export class DatabaseMedicationService implements MedicationService {
  // Properties

  private readonly databaseService: DatabaseService;

  // Constructor

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }

  // Methods - Medication Request Context

  async getContext(
    request: Document<FhirMedicationRequest>,
  ): Promise<MedicationRequestContext> {
    const drugReference = request.content.value.medicationReference;
    if (drugReference === undefined)
      throw new Error("Drug reference not found");
    const drug = (await this.getReference(drugReference))?.content;
    if (drug === undefined)
      throw new Error(`Drug not found at ${drugReference.reference}`);
    const medicationReference: Reference = {
      reference: drugReference.reference?.split("/").slice(0, 2).join("/"),
    };
    const medication = (await this.getReference(medicationReference))?.content;
    medicationReference.display = medication?.displayName;
    if (medication === undefined)
      throw new Error(
        `Medication not found at ${medicationReference.reference}`,
      );
    const medicationClassReference = medication.medicationClassReference;
    if (medicationClassReference === undefined)
      throw new Error("Medication class reference not found");
    const medicationClass = (
      await this.getClassReference(medicationClassReference)
    )?.content;
    if (medicationClass === undefined)
      throw new Error(
        `Medication class not found at ${medicationClassReference.reference}`,
      );
    return {
      lastUpdate: request.lastUpdate,
      requestReference: { reference: request.path },
      request: request.content,
      drugReference,
      drug,
      medicationReference,
      medication,
      medicationClassReference,
      medicationClass,
    };
  }

  // Methods - Medication Classes

  async getMedicationClasses(): Promise<Array<Document<MedicationClass>>> {
    return this.databaseService.getQuery(
      (collections) => collections.medicationClasses,
    );
  }

  async getMedicationClass(
    medicationClassId: string,
  ): Promise<Document<MedicationClass> | undefined> {
    return this.databaseService.getDocument((collections) =>
      collections.medicationClasses.doc(medicationClassId),
    );
  }

  // Methods - Medications

  async getMedications(): Promise<Array<Document<FhirMedication>>> {
    return this.databaseService.getQuery(
      (collections) => collections.medications,
    );
  }

  async getMedication(
    medicationId: string,
  ): Promise<Document<FhirMedication> | undefined> {
    return this.databaseService.getDocument((collections) =>
      collections.medications.doc(medicationId),
    );
  }

  // Methods - Drugs

  async getDrugs(
    medicationId: string,
  ): Promise<Array<Document<FhirMedication>>> {
    return this.databaseService.getQuery((collections) =>
      collections.drugs(medicationId),
    );
  }

  async getDrug(
    medicationId: string,
    drugId: string,
  ): Promise<Document<FhirMedication> | undefined> {
    return this.databaseService.getDocument((collections) =>
      collections.drugs(medicationId).doc(drugId),
    );
  }

  // References

  async getClassReference(
    reference: Reference | undefined,
  ): Promise<Document<MedicationClass> | undefined> {
    const doc = reference?.reference;
    if (!doc) return undefined;
    return this.databaseService.getDocument<MedicationClass>((collections) =>
      collections.medicationClassReference(doc),
    );
  }

  async getReference(
    reference: Reference | undefined,
  ): Promise<Document<FhirMedication> | undefined> {
    const doc = reference?.reference;
    if (!doc) return undefined;
    return this.databaseService.getDocument<FhirMedication>((collections) =>
      collections.medicationReference(doc),
    );
  }
}
