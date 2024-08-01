//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type MedicationClassSpecification,
  type RxNormService,
} from './rxNormService.js'
import { type FHIRMedication } from '../../../models/fhir/medication.js'
import { type DatabaseService } from '../../database/databaseService.js'
import { type CachingStrategy, SeedingService } from '../seedingService.js'

export class StaticDataService extends SeedingService {
  // Properties

  private databaseService: DatabaseService
  private rxNormService: RxNormService

  // Constructor

  constructor(databaseService: DatabaseService, rxNormService: RxNormService) {
    super({ useIndicesAsKeys: true, path: './data/' })
    this.databaseService = databaseService
    this.rxNormService = rxNormService
  }

  // Methods

  async updateMedications(strategy: CachingStrategy) {
    const { medications, drugs } =
      await this.retrieveMedicationsInformation(strategy)
    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        await this.deleteCollection('medications', firestore, transaction)
        this.setUnstructuredCollection(
          firestore.collection('medications'),
          medications,
          transaction,
        )
        for (const medicationId in drugs) {
          this.setUnstructuredCollection(
            firestore
              .collection('medications')
              .doc(medicationId)
              .collection('drugs'),
            drugs[medicationId],
            transaction,
          )
        }
      },
    )
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  async updateMedicationClasses(strategy: CachingStrategy) {
    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        await this.deleteCollection('medicationClasses', firestore, transaction)
        this.setStructuredCollection(
          firestore.collection('medicationClasses'),
          this.readJSON('medicationClasses.json'),
          transaction,
        )
      },
    )
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  async updateOrganizations(strategy: CachingStrategy) {
    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        await this.deleteCollection('organizations', firestore, transaction)
        this.setUnstructuredCollection(
          firestore.collection('organizations'),
          this.readJSON('organizations.json'),
          transaction,
        )
      },
    )
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  async updateQuestionnaires(strategy: CachingStrategy) {
    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        await this.deleteCollection('questionnaires', firestore, transaction)
        this.setUnstructuredCollection(
          firestore.collection('questionnaires'),
          this.readJSON('questionnaires.json'),
          transaction,
        )
      },
    )
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  async updateVideoSections(strategy: CachingStrategy) {
    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        await this.deleteCollection('videoSections', firestore, transaction)
        this.setStructuredCollection(
          firestore.collection('videoSections'),
          this.readJSON('videoSections.json'),
          transaction,
        )
      },
    )
  }

  // Helpers

  private async retrieveMedicationsInformation(
    strategy: CachingStrategy,
  ): Promise<{
    medications: Record<string, FHIRMedication>
    drugs: Record<string, Record<string, FHIRMedication>>
  }> {
    const medicationsFile = 'medications.json'
    const drugsFile = 'drugs.json'

    return this.cache(
      strategy,
      () => ({
        medications: this.readJSON(medicationsFile),
        drugs: this.readJSON(drugsFile),
      }),
      async () => {
        const data: MedicationClassSpecification[] = await this.readJSON(
          'medicationCodes.json',
        )
        return this.rxNormService.buildFHIRCollections(data)
      },
      (result) => {
        this.writeJSON('medications.json', result.medications)
        this.writeJSON('drugs.json', result.drugs)
      },
    )
  }
}
