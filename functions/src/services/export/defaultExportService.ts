//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import archiver, { Archiver } from "archiver";
import { UserService } from "../user/userService";
import { ExportService } from "./exportService";
import { FHIRQuestionnaireItem, FHIRQuestionnaireResponseItem, LoincCode, UserObservationCollection } from "@stanfordbdhg/engagehf-models";
import { DatabaseService } from "../database/databaseService";
import { QuestionnaireId, QuestionnaireLinkId } from "../seeding/staticData/questionnaireFactory/questionnaireLinkIds";
import { https } from "firebase-functions/v2";

export class DefaultExportService implements ExportService {
  private readonly databaseService: DatabaseService;
  private readonly userService: UserService;

  constructor(
    databaseService: DatabaseService, 
    userService: UserService
  ) {
    this.databaseService = databaseService;
    this.userService = userService;
  }

  async exportPatientDataForUser(userId: string): Promise<Buffer> {
    const patient = await this.userService.getUser(userId);
    if (!patient) {
      throw new https.HttpsError("not-found", `Patient with ID ${userId} not found`);
    }
    return await this.createPatientsZipBuffer([patient.id]);
  }

  async exportPatientDataForOrganization(organizationId: string): Promise<Buffer> {
    const patients = await this.userService.getAllPatients();
    const filteredPatients = patients.filter(
      (patient) => patient.content.organization === organizationId,
    );
    return await this.createPatientsZipBuffer(
      filteredPatients.map(patient => patient.id)
    );
  }

  async exportPatientDataForAll(): Promise<Buffer> {
    const patients = await this.userService.getAllPatients();
    return await this.createPatientsZipBuffer(
      patients.map(patient => patient.id)
    );
  }

  // Helpers - Patient Data Export

  private async createPatientsZipBuffer(
    userIds: string[],
  ): Promise<Buffer> {
    return this.createZipBuffer(
      async (archive) => {
        await this.addQuestionnaires(archive);
        for (const userId of userIds) {
          await Promise.all([
            this.addUserAppointments(userId, archive),
            this.addUserMedicationRequests(userId, archive),
            this.addUserMessages(userId, archive),
            ...Object.values(UserObservationCollection).map(
              (collection) => this.addUserObservations(userId, collection, archive)
            ),
            this.addUserQuestionnaireResponses(userId, archive),
            this.addUserSymptomScores(userId, archive),
          ]);
        }
      },
    );
  }

  private async addQuestionnaires(archiver: Archiver): Promise<void> {
    const questionnaires = await this.databaseService.getQuery((collections) =>
      collections.questionnaires
    );

    function leafItems(item: FHIRQuestionnaireItem): FHIRQuestionnaireItem[] {
      if (!item.item || item.item.length === 0) {
        return [item];
      }

      return item.item.flatMap((child) => leafItems(child));
    }

    for (const questionnaire of questionnaires) {
      const items = (questionnaire.content.item ?? [])
        .flatMap((item) => leafItems(item));

      const buffer = await this.createCsvBuffer(
        ["linkId", "text", "type", "options"],
        items,
        (value) => {
          const options = (value.answerOption ?? [])
            .map((option) => `${JSON.stringify(option.valueCoding?.display ?? "")} (${option.valueCoding?.code ?? ""})`)
            .join("|");

          return [
            value.linkId ?? "",
            JSON.stringify(value.text ?? ""),
            value.type ?? "",
            options,
          ];
        }
      );

      archiver.append(buffer, { name: `questionnaire_${questionnaire.id}.csv` });
    }
  }

  private async addUserAppointments(userId: string, archiver: Archiver): Promise<void> {
    const appointments = await this.databaseService.getQuery((collections) =>
      collections.userAppointments(userId)
    );

    const buffer = await this.createCsvBuffer(
      ["id", "status", "created", "start", "end"],
      appointments,
      (value) => [
        value.id,
        value.content.status,
        value.content.created.toISOString() ?? "",
        value.content.start?.toISOString() ?? "",
        value.content.end?.toISOString() ?? "",
      ]
    );

    archiver.append(buffer, { name: `${userId}/appointments.csv` });
  }

  private async addUserMessages(
    userId: string,
    archiver: Archiver
  ): Promise<void> {
    const messages = await this.databaseService.getQuery((collections) =>
      collections.userMessages(userId)
    );
    
    const buffer = await this.createCsvBuffer(
      ["id", "type", "title", "action", "reference", "creationDate", "completionDate", "dueDate"],
      messages,
      (value) => [
        value.id,
        value.content.type,
        value.content.title.localize(),
        value.content.action ?? "",
        value.content.reference ?? "",
        value.content.creationDate.toISOString(),
        value.content.completionDate?.toISOString() ?? "",
        value.content.dueDate?.toISOString() ?? "",
      ]
    );

    archiver.append(buffer, { name: `${userId}/messages.csv` });
  }

  private async addUserMedicationRequests(
    userId: string,
    archiver: Archiver
  ): Promise<void> {
    const medications = await this.databaseService.getQuery((collections) =>
      collections.userMedicationRequests(userId)
    );

    const buffer = await this.createCsvBuffer(
      ["id", "medicationCode (RxNorm)", "drugCode (RxNorm)", "quantity", "quantityUnit", "frequencyPerDay"],
      medications,
      (value) => {
        const referenceParts = value.content.medicationReference?.reference?.split("/") ?? [];
        const quantity = value.content.dosageInstruction?.at(0)?.doseAndRate?.at(0)?.doseQuantity;
        const frequency = value.content.dosageInstruction?.at(0)?.timing?.repeat?.frequency;
        return [
          value.id,
          referenceParts[1],
          referenceParts[3],
          quantity?.value?.toString() ?? "",
          quantity?.unit ?? "",
          frequency?.toString() ?? "",
        ];
      }
    );

    archiver.append(buffer, { name: `${userId}/medicationRequests.csv` });
  }

  private async addUserObservations(
    userId: string, 
    collection: UserObservationCollection, 
    archiver: Archiver
  ): Promise<void> {
    const observations = await this.databaseService.getQuery((collections) =>
      collections.userObservations(userId, collection)
    );
  
    let buffer: Buffer;
    switch (collection) {
      case UserObservationCollection.bloodPressure:
        buffer = await this.createCsvBuffer(
          ["id", "systolicValue", "systolicUnit", "diastolicValue", "diastolicUnit", "effectiveDateTime"],
          observations,
          (value) => {
            const systolicComponent = value.content.component?.find(
              (component) => component.code.coding?.some(
                (coding) => coding.code === LoincCode.systolicBloodPressure,
              ),
            );
            const diastolicComponent = value.content.component?.find(
              (component) => component.code.coding?.some(
                (coding) => coding.code === LoincCode.diastolicBloodPressure,
              ),
            );
            return [
              value.id,
              systolicComponent?.valueQuantity?.value?.toString() ?? "",
              systolicComponent?.valueQuantity?.unit ?? "",
              diastolicComponent?.valueQuantity?.value?.toString() ?? "",
              diastolicComponent?.valueQuantity?.unit ?? "",
              value.content.effectiveDateTime?.toISOString() ?? "",
            ];
          }
        );
        break;
      default:
        buffer = await this.createCsvBuffer(
          ["id", "value", "unit", "effectiveDateTime"],
          observations,
          (value) => [
            value.id,
            value.content.valueQuantity?.value?.toString() ?? "",
            value.content.valueQuantity?.unit ?? "",
            value.content.effectiveDateTime?.toISOString() ?? "",
          ]
        );
        break;
    }
    archiver.append(buffer, { name: `${userId}/${collection}.csv` });
  }

  private async addUserQuestionnaireResponses(
    userId: string,
    archiver: Archiver
  ): Promise<void> {
    const questionnaireResponses = await this.databaseService.getQuery((collections) =>
      collections.userQuestionnaireResponses(userId)
    );

    const kccqResponses = questionnaireResponses.filter(
      (response) => response.content.questionnaire === QuestionnaireLinkId.url(
        QuestionnaireId.kccq,
      )
    );

    const buffer = await this.createCsvBuffer(
      ["id", "q1a", "q1b", "q1c", "q2", "q3", "q4", "q5", "q6", "q7", "q8a", "q8b", "q8c", "q9", "authored"],
      kccqResponses,
      (value) => {
        return [
          value.id,
          value.content.leafResponseItem(QuestionnaireLinkId.kccq.question1a)?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content.leafResponseItem(QuestionnaireLinkId.kccq.question1b)?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content.leafResponseItem(QuestionnaireLinkId.kccq.question1c)?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content.leafResponseItem(QuestionnaireLinkId.kccq.question2)?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content.leafResponseItem(QuestionnaireLinkId.kccq.question3)?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content.leafResponseItem(QuestionnaireLinkId.kccq.question4)?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content.leafResponseItem(QuestionnaireLinkId.kccq.question5)?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content.leafResponseItem(QuestionnaireLinkId.kccq.question6)?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content.leafResponseItem(QuestionnaireLinkId.kccq.question7)?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content.leafResponseItem(QuestionnaireLinkId.kccq.question8a)?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content.leafResponseItem(QuestionnaireLinkId.kccq.question8b)?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content.leafResponseItem(QuestionnaireLinkId.kccq.question8c)?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content.leafResponseItem(QuestionnaireLinkId.kccq.question9)?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content.authored?.toISOString() ?? "",
        ];
      }
    );

    archiver.append(buffer, { name: `${userId}/questionnaireResponses_kccq.csv` });
  }

  private async addUserSymptomScores(
    userId: string,
    archiver: Archiver
  ): Promise<void> {
    const symptomScores = await this.databaseService.getQuery((collections) =>
      collections.userSymptomScores(userId)
    );

    const buffer = await this.createCsvBuffer(
      ["id", "overallScore", "physicalLimitsScore", "socialLimitsScore", "symptomFrequencyScore", "qualityOfLifeScore", "dizzinessScore", "date", "questionnaireResponseId"],
      symptomScores,
      (value) => [
        value.id,
        value.content.overallScore?.toString() ?? "",
        value.content.physicalLimitsScore?.toString() ?? "",
        value.content.socialLimitsScore?.toString() ?? "",
        value.content.symptomFrequencyScore?.toString() ?? "",
        value.content.qualityOfLifeScore?.toString() ?? "",
        value.content.dizzinessScore?.toString() ?? "",
        value.content.date.toISOString(),
        value.content.questionnaireResponseId ?? "",
      ]
    );

    archiver.append(buffer, { name: `${userId}/symptomScores.csv` });
  }

  // Helpers - File Creation

  private async createCsvBuffer<T>(
    headers: string[], 
    values: T[],
    row: (item: T) => string[]
  ): Promise<Buffer> {
    const string = [
      headers.join(";"),
      ...values.map(item => row(item).join(";"))
    ].join("\n");
    return Buffer.from(string);
  }

  private async createZipBuffer(
    generate: (archiver: Archiver) => Promise<void>
  ): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const archive = archiver("zip", { zlib: { level: 9 } });
      const chunks: Buffer[] = [];
      
      archive.on("data", (chunk) => {
        chunks.push(chunk);
      });

      archive.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      archive.on("error", (err) => {
        reject(err);
      });

      generate(archive)
         .then(() => archive.finalize())
         .catch(reject);
    });
  }
}