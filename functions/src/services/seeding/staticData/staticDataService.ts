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
  type RxNormService,
} from './rxNormService.js'
import {
  fhirMedicationConverter,
  type FHIRMedication,
} from '../../../models/fhir/fhirMedication.js'
import { fhirQuestionnaireConverter } from '../../../models/fhir/fhirQuestionnaire.js'
import { localizedTextConverter } from '../../../models/types/localizedText.js'
import {
  medicationClassConverter,
  type MedicationClass,
} from '../../../models/types/medicationClass.js'
import { organizationConverter } from '../../../models/types/organization.js'
import { Video } from '../../../models/types/video.js'
import { VideoSection } from '../../../models/types/videoSection.js'
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
        this.setCollection(collections.medications, medications, transaction)
        for (const medicationId in drugs) {
          this.setCollection(
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
        this.setCollection(
          collections.medicationClasses,
          this.readJSONArray(
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
        this.setCollection(
          collections.organizations,
          this.readJSONRecord(
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
        this.setCollection(
          collections.questionnaires,
          this.readJSONArray(
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
        const videoSections = this.readJSONArray(
          'videoSections.json',
          z.object({
            title: localizedTextConverter.schema,
            description: localizedTextConverter.schema,
            orderIndex: z.number(),
            videos: z
              .object({
                title: localizedTextConverter.schema,
                youtubeId: localizedTextConverter.schema,
                orderIndex: z.number(),
                description: z.string(),
              })
              .array(),
          }),
        )

        let videoSectionIndex = 0
        for (const videoSection of videoSections) {
          const videoSectionId = videoSectionIndex.toString()
          transaction.set(
            collections.videoSections.doc(videoSectionId),
            new VideoSection(videoSection),
          )

          let videoIndex = 0
          for (const video of videoSection.videos) {
            const videoId = videoIndex.toString()
            transaction.set(
              collections.videos(videoSectionId).doc(videoId),
              new Video(video),
            )
            videoIndex++
          }
          videoSectionIndex++
        }
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
        medications: this.readJSONRecord(
          medicationsFile,
          fhirMedicationConverter.value.schema,
        ),
        drugs: this.readJSONRecord(
          drugsFile,
          z.record(z.string(), fhirMedicationConverter.value.schema),
        ),
      }),
      async () => {
        const medicationClasses = this.readJSONArray(
          'medicationClasses.json',
          medicationClassConverter.value.schema,
        )
        const medicationClassMap = new Map<string, MedicationClass>()
        medicationClasses.forEach((medicationClass, index) => {
          medicationClassMap.set(index.toString(), medicationClass)
        })
        const specification = this.readJSONArray(
          'medicationCodes.json',
          medicationClassSpecificationSchema,
        )
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
