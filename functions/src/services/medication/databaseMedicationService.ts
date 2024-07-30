//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type MedicationService } from './medicationService.js'
import { type FHIRReference } from '../../models/fhir/baseTypes.js'
import {
  type FHIRMedicationRequest,
  type FHIRMedication,
} from '../../models/fhir/medication.js'
import { type MedicationClass } from '../../models/medicationClass.js'
import { type MedicationRequestContext } from '../../models/medicationRequestContext.js'
import {
  type Document,
  type DatabaseService,
} from '../database/databaseService.js'
import { type FhirService } from '../fhir/fhirService.js'

export class DatabaseMedicationService implements MedicationService {
  // Properties

  private readonly databaseService: DatabaseService
  private readonly fhirService: FhirService

  // Constructor

  constructor(databaseService: DatabaseService, fhirService: FhirService) {
    this.databaseService = databaseService
    this.fhirService = fhirService
  }

  // Methods - Medication Request Context

  async getContext(
    request: FHIRMedicationRequest,
    reference: FHIRReference<FHIRMedicationRequest>,
  ): Promise<MedicationRequestContext> {
    const result: MedicationRequestContext = {
      request: request,
      requestReference: reference,
    }
    result.drugReference = request.medicationReference
    result.drug = (await this.getReference(result.drugReference))?.content
    result.medicationReference = {
      reference: result.drugReference?.reference
        ?.split('/')
        .slice(0, 2)
        .join('/'),
    }
    result.medication = (
      await this.getReference(result.medicationReference)
    )?.content
    if (!result.medication) return result
    result.medicationClassReference = this.fhirService.medicationClassReference(
      result.medication,
    )
    result.medicationClass = (
      await this.getClassReference(result.medicationClassReference)
    )?.content
    return result
  }

  // Methods - Medication Classes

  async getMedicationClasses(): Promise<Array<Document<MedicationClass>>> {
    return this.databaseService.getCollection('medicationClasses')
  }

  async getMedicationClass(
    medicationClassId: string,
  ): Promise<Document<MedicationClass> | undefined> {
    return this.databaseService.getDocument(
      `medicationClasses/${medicationClassId}`,
    )
  }

  // Methods - Medications

  async getMedications(): Promise<Array<Document<FHIRMedication>>> {
    return this.databaseService.getCollection('medications')
  }

  async getMedication(
    medicationId: string,
  ): Promise<Document<FHIRMedication> | undefined> {
    return this.databaseService.getDocument(`medications/${medicationId}`)
  }

  // Methods - Drugs

  async getDrugs(
    medicationId: string,
  ): Promise<Array<Document<FHIRMedication>>> {
    return this.databaseService.getCollection(
      `medications/${medicationId}/drugs`,
    )
  }

  async getDrug(
    medicationId: string,
    drugId: string,
  ): Promise<Document<FHIRMedication> | undefined> {
    return this.databaseService.getDocument(
      `medications/${medicationId}/drugs/${drugId}`,
    )
  }

  // Helpers

  private async getClassReference(
    reference: FHIRReference<MedicationClass> | undefined,
  ): Promise<Document<MedicationClass> | undefined> {
    if (!reference?.reference) return undefined
    return this.databaseService.getDocument<MedicationClass>(
      reference.reference,
    )
  }

  private async getReference(
    reference: FHIRReference<FHIRMedication> | undefined,
  ): Promise<Document<FHIRMedication> | undefined> {
    if (!reference?.reference) return undefined
    return this.databaseService.getDocument<FHIRMedication>(reference.reference)
  }
}
