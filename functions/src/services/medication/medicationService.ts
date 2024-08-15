//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type FHIRMedicationRequest } from '../../models/fhir/baseTypes/fhirElement.js'
import { type FHIRReference } from '../../models/fhir/baseTypes/fhirReference.js'
import { type FHIRMedication } from '../../models/fhir/fhirMedication.js'
import { type MedicationRequestContext } from '../../models/medicationRequestContext.js'
import { type MedicationClass } from '../../models/types/medicationClass.js'
import { type Document } from '../database/databaseService.js'

export interface MedicationService {
  // Medication Request Context

  getContext(
    request: FHIRMedicationRequest,
    reference: FHIRReference,
  ): Promise<MedicationRequestContext>

  // Medication Classes

  getMedicationClasses(): Promise<Array<Document<MedicationClass>>>
  getMedicationClass(
    medicationClassId: string,
  ): Promise<Document<MedicationClass> | undefined>

  // Medications

  getMedications(): Promise<Array<Document<FHIRMedication>>>

  getMedication(
    medicationId: string,
  ): Promise<Document<FHIRMedication> | undefined>

  // Drugs

  getDrugs(medicationId: string): Promise<Array<Document<FHIRMedication>>>

  getDrug(
    medicationId: string,
    drugId: string,
  ): Promise<Document<FHIRMedication> | undefined>

  // References

  getClassReference(
    reference: FHIRReference | undefined,
  ): Promise<Document<MedicationClass> | undefined>

  getReference(
    reference: FHIRReference | undefined,
  ): Promise<Document<FHIRMedication> | undefined>
}
