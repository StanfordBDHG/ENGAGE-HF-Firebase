//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type FHIRMedication } from '../../models/fhir/medication.js'
import { type MedicationClass } from '../../models/medicationClass.js'
import { type DatabaseDocument } from '../database/databaseService.js'

export interface MedicationService {
  // Medication Classes

  getMedicationClasses(): Promise<Array<DatabaseDocument<MedicationClass>>>
  getMedicationClass(
    medicationClassId: string,
  ): Promise<DatabaseDocument<MedicationClass> | undefined>

  // Medications

  getMedications(): Promise<Array<DatabaseDocument<FHIRMedication>>>

  getMedication(
    medicationId: string,
  ): Promise<DatabaseDocument<FHIRMedication> | undefined>

  // Drugs

  getDrugs(
    medicationId: string,
  ): Promise<Array<DatabaseDocument<FHIRMedication>>>

  getDrug(
    medicationId: string,
    drugId: string,
  ): Promise<DatabaseDocument<FHIRMedication> | undefined>
}
