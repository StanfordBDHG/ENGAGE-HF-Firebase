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
    const drugReference = request.medicationReference
    if (!drugReference) throw new Error('Drug reference not found')
    const drug = (await this.getReference(drugReference))?.content
    if (!drug) throw new Error('Drug not found')
    const medicationReference: FHIRReference<FHIRMedication> = {
      reference: drugReference.reference?.split('/').slice(0, 2).join('/'),
    }
    const medication = (await this.getReference(medicationReference))?.content
    medicationReference.display =
      medication ? this.fhirService.displayName(medication) : undefined
    if (!medication) throw new Error('Medication not found')
    const medicationClassReference =
      this.fhirService.medicationClassReference(medication)
    if (!medicationClassReference)
      throw new Error('Medication class reference not found')
    const medicationClass = (
      await this.getClassReference(medicationClassReference)
    )?.content
    if (!medicationClass) throw new Error('Medication class not found')
    return {
      requestReference: reference,
      request,
      drugReference,
      drug,
      medicationReference,
      medication,
      medicationClassReference,
      medicationClass,
    }
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

  // References

  async getClassReference(
    reference: FHIRReference<MedicationClass> | undefined,
  ): Promise<Document<MedicationClass> | undefined> {
    if (!reference?.reference) return undefined
    return this.databaseService.getDocument<MedicationClass>(
      reference.reference,
    )
  }

  async getReference(
    reference: FHIRReference<FHIRMedication> | undefined,
  ): Promise<Document<FHIRMedication> | undefined> {
    if (!reference?.reference) return undefined
    return this.databaseService.getDocument<FHIRMedication>(reference.reference)
  }
}
