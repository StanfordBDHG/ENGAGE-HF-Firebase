//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type FHIRMedication } from '../../models/fhir/medication.js'
import { type MedicationClass } from '../../models/medicationClass.js'
import { type Document } from '../database/databaseService.js'

export interface MedicationService {
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
}
