import { type MedicationService } from './medicationService.js'
import { type FHIRMedication } from '../../models/fhir/medication.js'
import { type MedicationClass } from '../../models/medicationClass.js'
import {
  type DatabaseDocument,
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

  async getMedicationClasses(): Promise<
    Array<DatabaseDocument<MedicationClass>>
  > {
    return this.databaseService.getCollection('medicationClasses')
  }

  async getMedicationClass(
    medicationClassId: string,
  ): Promise<DatabaseDocument<MedicationClass | undefined>> {
    return this.databaseService.getDocument(
      `medicationClasses/${medicationClassId}`,
    )
  }

  // Methods - Medications

  async getMedications(): Promise<Array<DatabaseDocument<FHIRMedication>>> {
    return this.databaseService.getCollection('medications')
  }

  async getMedication(
    medicationId: string,
  ): Promise<DatabaseDocument<FHIRMedication | undefined>> {
    return this.databaseService.getDocument(`medications/${medicationId}`)
  }

  // Methods - Drugs

  async getDrugs(
    medicationId: string,
  ): Promise<Array<DatabaseDocument<FHIRMedication>>> {
    return this.databaseService.getCollection(
      `medications/${medicationId}/drugs`,
    )
  }

  async getDrug(
    medicationId: string,
    drugId: string,
  ): Promise<DatabaseDocument<FHIRMedication | undefined>> {
    return this.databaseService.getDocument(
      `medications/${medicationId}/drugs/${drugId}`,
    )
  }
}
