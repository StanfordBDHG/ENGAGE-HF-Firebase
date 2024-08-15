//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import {
  medicationClassSpecificationSchema,
  type MedicationClassSpecification,
  type RxNormService,
} from './rxNormService.js'
import {
  fhirMedicationConverter,
  type FHIRMedication,
} from '../../../models/fhir/fhirMedication.js'
import { fhirQuestionnaireConverter } from '../../../models/fhir/fhirQuestionnaire.js'
import {
  medicationClassConverter,
  type MedicationClass,
} from '../../../models/types/medicationClass.js'
import { organizationConverter } from '../../../models/types/organization.js'
import { videoSectionConverter } from '../../../models/types/videoSection.js'
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
      async (collections, transaction) => {
        await this.deleteCollection(collections.medications, transaction)
        this.setUnstructuredCollection(
          collections.medications,
          medications,
          transaction,
        )
        for (const medicationId in drugs) {
          this.setUnstructuredCollection(
            collections.drugs(medicationId),
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
      async (collections, transaction) => {
        await this.deleteCollection(collections.medicationClasses, transaction)
        this.setStructuredCollection(
          collections.medicationClasses,
          this.readJSON(
            'medicationClasses.json',
            medicationClassConverter.value.schema,
          ),
          transaction,
        )
      },
    )
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  async updateOrganizations(strategy: CachingStrategy) {
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        await this.deleteCollection(collections.organizations, transaction)
        this.setUnstructuredCollection(
          collections.organizations,
          this.readJSON(
            'organizations.json',
            organizationConverter.value.schema,
          ),
          transaction,
        )
      },
    )
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  async updateQuestionnaires(strategy: CachingStrategy) {
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        await this.deleteCollection(collections.questionnaires, transaction)
        this.setUnstructuredCollection(
          collections.questionnaires,
          this.readJSON(
            'questionnaires.json',
            fhirQuestionnaireConverter.value.schema,
          ),
          transaction,
        )
      },
    )
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  async updateVideoSections(strategy: CachingStrategy) {
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        await this.deleteCollection(collections.videoSections, transaction)
        this.setStructuredCollection(
          collections.videoSections,
          this.readJSON(
            'videoSections.json',
            videoSectionConverter.value.schema,
          ),
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
        medications: this.readJSON(
          medicationsFile,
          fhirMedicationConverter.value.schema,
        ) as Record<string, FHIRMedication>,
        drugs: this.readJSON(
          drugsFile,
          z.record(z.string(), fhirMedicationConverter.value.schema),
        ) as Record<string, Record<string, FHIRMedication>>,
      }),
      async () => {
        const medicationClasses = this.readJSON(
          'medicationClasses.json',
          medicationClassConverter.value.schema,
        ) as MedicationClass[]
        const medicationClassMap = new Map<string, MedicationClass>()
        medicationClasses.forEach((medicationClass, index) => {
          medicationClassMap.set(index.toString(), medicationClass)
        })
        const specification = this.readJSON(
          'medicationCodes.json',
          medicationClassSpecificationSchema,
        ) as MedicationClassSpecification[]
        return this.rxNormService.buildFHIRCollections(
          medicationClassMap,
          specification,
        )
      },
      (result) => {
        this.writeJSON('medications.json', result.medications)
        this.writeJSON('drugs.json', result.drugs)
      },
    )
  }
}
