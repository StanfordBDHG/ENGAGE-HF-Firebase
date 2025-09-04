//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  CachingStrategy,
  type FHIRMedication,
  fhirMedicationConverter,
  type FHIRQuestionnaire,
  fhirQuestionnaireConverter,
  localizedTextConverter,
  type MedicationClass,
  medicationClassConverter,
  organizationConverter,
  QuestionnaireReference,
  Video,
  VideoSection,
} from "@stanfordbdhg/engagehf-models";
import { z } from "zod";
import {
  medicationClassSpecificationSchema,
  type RxNormService,
} from "./rxNorm/rxNormService.js";
import { type DatabaseService } from "../../database/databaseService.js";
import { SeedingService } from "../seedingService.js";
import { DataUpdateQuestionnaireFactory } from "./questionnaireFactory/dataUpdateQuestionnaireFactory.js";
import { KccqQuestionnaireFactory } from "./questionnaireFactory/kccqQuestionnaireFactory.js";
import { RegistrationQuestionnaireFactory } from "./questionnaireFactory/registrationQuestionnaireFactory.js";

export class StaticDataService extends SeedingService {
  // Properties

  private databaseService: DatabaseService;
  private rxNormService: RxNormService;

  // Constructor

  constructor(databaseService: DatabaseService, rxNormService: RxNormService) {
    super({ useIndicesAsKeys: true, path: "./data/" });
    this.databaseService = databaseService;
    this.rxNormService = rxNormService;
  }

  // Methods

  async updateMedications(strategy: CachingStrategy) {
    const { medications, drugs } =
      await this.retrieveMedicationsInformation(strategy);
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        await this.deleteCollection(collections.medications, transaction);
        this.setCollection(collections.medications, medications, transaction);
        for (const medicationId in drugs) {
          this.setCollection(
            collections.drugs(medicationId),
            drugs[medicationId],
            transaction,
          );
        }
      },
    );
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  async updateMedicationClasses(strategy: CachingStrategy) {
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        await this.deleteCollection(collections.medicationClasses, transaction);
        this.setCollection(
          collections.medicationClasses,
          this.readJSONArray(
            "medicationClasses.json",
            medicationClassConverter.value.schema,
          ),
          transaction,
        );
      },
    );
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  async updateOrganizations(strategy: CachingStrategy) {
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        await this.deleteCollection(collections.organizations, transaction);
        this.setCollection(
          collections.organizations,
          this.readJSONRecord(
            "organizations.json",
            organizationConverter.value.schema,
          ),
          transaction,
        );
      },
    );
  }

  async updateQuestionnaires(strategy: CachingStrategy) {
    const questionnaires = await this.retrieveQuestionnaires(strategy);
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        await this.deleteCollection(collections.questionnaires, transaction);
        this.setCollection(
          collections.questionnaires,
          questionnaires,
          transaction,
        );
      },
    );
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  async updateVideoSections(strategy: CachingStrategy) {
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        await this.deleteCollection(collections.videoSections, transaction);
        const videoSections = this.readJSONArray(
          "videoSections.json",
          z.object({
            title: localizedTextConverter.schema,
            description: localizedTextConverter.schema,
            orderIndex: z.number(),
            videos: z
              .object({
                title: localizedTextConverter.schema,
                youtubeId: localizedTextConverter.schema,
                orderIndex: z.number(),
                description: localizedTextConverter.schema,
              })
              .array(),
          }),
        );

        let videoSectionIndex = 0;
        for (const videoSection of videoSections) {
          const videoSectionId = videoSectionIndex.toString();
          transaction.set(
            collections.videoSections.doc(videoSectionId),
            new VideoSection(videoSection),
          );

          let videoIndex = 0;
          for (const video of videoSection.videos) {
            const videoId = videoIndex.toString();
            transaction.set(
              collections.videos(videoSectionId).doc(videoId),
              new Video(video),
            );
            videoIndex++;
          }
          videoSectionIndex++;
        }
      },
    );
  }

  // Helpers

  private async retrieveQuestionnaires(
    strategy: CachingStrategy,
  ): Promise<Record<string, FHIRQuestionnaire>> {
    const questionnairesFile = "questionnaires.json";

    return this.cache(
      strategy,
      () =>
        this.readJSONRecord(
          questionnairesFile,
          fhirQuestionnaireConverter.value.schema,
        ),
      async () => this.generateQuestionnaires(),
      (result) =>
        this.writeJSON(
          "questionnaires.json",
          Object.fromEntries(
            Object.entries(result).map(([key, value]) => [
              key,
              fhirQuestionnaireConverter.value.encode(value),
            ]),
          ),
        ),
    );
  }

  private async generateQuestionnaires(): Promise<
    Record<string, FHIRQuestionnaire>
  > {
    const { medications, drugs } = await this.retrieveMedicationsInformation(
      CachingStrategy.expectCache,
    );

    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [QuestionnaireReference.kccq_en_US.split("/").at(-1)!]:
        new KccqQuestionnaireFactory().create(),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [QuestionnaireReference.registration_en_US.split("/").at(-1)!]:
        new RegistrationQuestionnaireFactory().create({
          medications,
          drugs,
        }),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [QuestionnaireReference.dataUpdate_en_US.split("/").at(-1)!]:
        new DataUpdateQuestionnaireFactory().create({
          medications,
          drugs,
          isPostAppointment: false,
        }),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [QuestionnaireReference.postAppointment_en_US.split("/").at(-1)!]:
        new DataUpdateQuestionnaireFactory().create({
          medications,
          drugs,
          isPostAppointment: true,
        }),
    };
  }

  private async retrieveMedicationsInformation(
    strategy: CachingStrategy,
  ): Promise<{
    medications: Record<string, FHIRMedication>;
    drugs: Record<string, Record<string, FHIRMedication>>;
  }> {
    const medicationsFile = "medications.json";
    const drugsFile = "drugs.json";

    return this.cache(
      strategy,
      () => ({
        medications: this.readJSONRecord(
          medicationsFile,
          fhirMedicationConverter.value.schema,
        ),
        drugs: this.readJSONRecord(
          drugsFile,
          z.record(fhirMedicationConverter.value.schema),
        ),
      }),
      async () => {
        const medicationClasses = this.readJSONArray(
          "medicationClasses.json",
          medicationClassConverter.value.schema,
        );
        const medicationClassMap = new Map<string, MedicationClass>();
        medicationClasses.forEach((medicationClass, index) => {
          medicationClassMap.set(index.toString(), medicationClass);
        });
        const specification = this.readJSONArray(
          "medicationCodes.json",
          medicationClassSpecificationSchema,
        );
        return this.rxNormService.buildFHIRCollections(
          medicationClassMap,
          specification,
        );
      },
      (result) => {
        this.writeJSON("medications.json", result.medications);
        this.writeJSON("drugs.json", result.drugs);
      },
    );
  }
}
