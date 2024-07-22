//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type MedicationService } from './medicationService.js'
import { type FHIRMedication } from '../../models/fhir/medication.js'
import { type MedicationClass } from '../../models/medicationClass.js'
import {
  type Document,
  type DatabaseService,
} from '../database/databaseService.js'

export class DatabaseMedicationService implements MedicationService {
  // Properties

  private databaseService: DatabaseService

  // Constructor

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService
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
}
