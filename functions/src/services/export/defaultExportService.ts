//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  fhirMedicationRequestConverter,
  type FHIRQuestionnaireItem,
  LoincCode,
  UserObservationCollection,
} from "@stanfordbdhg/engagehf-models";
import archiver, { type Archiver } from "archiver";
import { https } from "firebase-functions/v2";
import { type ExportService } from "./exportService.js";
import {
  type DatabaseService,
  type Document,
} from "../database/databaseService.js";
import {
  QuestionnaireId,
  QuestionnaireLinkId,
} from "../seeding/staticData/questionnaireFactory/questionnaireLinkIds.js";
import { type UserService } from "../user/userService.js";

interface CsvData {
  readonly headers: readonly string[];
  readonly rows: ReadonlyArray<readonly string[]>;
}

interface UserCsvExport {
  readonly filename: string;
  readonly csv: CsvData;
}

/**
 * A single document reconstructed across its lifecycle from the global `/history`
 * collection (merged with the live collection). One record per document, so a
 * medication that was added and later removed yields exactly one row.
 */
interface LifecycleRecord<Content> {
  readonly id: string;
  readonly content: Content;
  readonly created?: Date;
  readonly lastUpdated?: Date;
  readonly removed?: Date;
}

export class DefaultExportService implements ExportService {
  private readonly databaseService: DatabaseService;
  private readonly userService: UserService;

  constructor(databaseService: DatabaseService, userService: UserService) {
    this.databaseService = databaseService;
    this.userService = userService;
  }

  async exportPatientDataForUser(userId: string): Promise<Buffer> {
    const patient = await this.userService.getUser(userId);
    if (!patient) {
      throw new https.HttpsError(
        "not-found",
        `Patient with ID ${userId} not found`,
      );
    }
    return this.createPatientsZipBuffer([patient.id]);
  }

  async exportPatientDataForOrganization(
    organizationId: string,
  ): Promise<Buffer> {
    const patients = await this.userService.getAllPatients();
    const filteredPatients = patients.filter(
      (patient) => patient.content.organization === organizationId,
    );
    return this.createPatientsZipBuffer(
      filteredPatients.map((patient) => patient.id),
    );
  }

  async exportPatientDataForAll(): Promise<Buffer> {
    const patients = await this.userService.getAllPatients();
    return this.createPatientsZipBuffer(patients.map((patient) => patient.id));
  }

  // Helpers - Patient Data Export

  private async createPatientsZipBuffer(userIds: string[]): Promise<Buffer> {
    return this.createZipBuffer(async (archive) => {
      await this.addQuestionnaires(archive);

      const mergedCategories = new Map<string, CsvData>();

      for (const userId of userIds) {
        const auth = await this.userService.getAuth(userId);
        const displayName = auth.displayName ?? "";

        const userExports = await this.exportUserData(userId, archive);

        for (const { filename, csv } of userExports) {
          const existing = mergedCategories.get(filename);
          const prefixedRows = csv.rows.map((row) => [
            displayName,
            userId,
            ...row,
          ]);
          if (existing === undefined) {
            mergedCategories.set(filename, {
              headers: ["name", "userId", ...csv.headers],
              rows: prefixedRows,
            });
          } else {
            mergedCategories.set(filename, {
              headers: existing.headers,
              rows: [...existing.rows, ...prefixedRows],
            });
          }
        }
      }

      for (const [filename, csv] of mergedCategories) {
        archive.append(this.formatCsvBuffer(csv.headers, csv.rows), {
          name: filename,
        });
      }
    });
  }

  private async exportUserData(
    userId: string,
    archive: Archiver,
  ): Promise<UserCsvExport[]> {
    const results = await Promise.all([
      this.addUserAppointments(userId, archive),
      this.addUserMedicationRequests(userId, archive),
      this.addUserMessages(userId, archive),
      ...Object.values(UserObservationCollection).map((collection) =>
        this.addUserObservations(userId, collection, archive),
      ),
      this.addUserQuestionnaireResponses(userId, archive),
      this.addUserSymptomScores(userId, archive),
    ]);
    return results;
  }

  private async addQuestionnaires(archiver: Archiver): Promise<void> {
    const questionnaires = await this.databaseService.getQuery(
      (collections) => collections.questionnaires,
    );

    function leafItems(item: FHIRQuestionnaireItem): FHIRQuestionnaireItem[] {
      if (!item.item || item.item.length === 0) {
        return [item];
      }

      return item.item.flatMap((child) => leafItems(child));
    }

    for (const questionnaire of questionnaires) {
      const items = (questionnaire.content.item ?? []).flatMap((item) =>
        leafItems(item),
      );

      const csv = this.createCsvData(
        ["linkId", "text", "type", "options"],
        items,
        (value) => {
          const options = (value.answerOption ?? [])
            .map(
              (option) =>
                `${option.valueCoding?.display ?? ""} (${option.valueCoding?.code ?? ""})`,
            )
            .join("|");

          return [
            value.linkId ?? "",
            value.text ?? "",
            value.type ?? "",
            options,
          ];
        },
      );

      archiver.append(this.formatCsvBuffer(csv.headers, csv.rows), {
        name: `questionnaire_${questionnaire.id}.csv`,
      });
    }
  }

  private async addUserAppointments(
    userId: string,
    archiver: Archiver,
  ): Promise<UserCsvExport> {
    const appointments = await this.databaseService.getQuery((collections) =>
      collections.userAppointments(userId),
    );

    const csv = this.createCsvData(
      ["id", "status", "created", "start", "end"],
      appointments,
      (value) => [
        value.id,
        value.content.status,
        value.content.created.toISOString(),
        value.content.start.toISOString(),
        value.content.end.toISOString(),
      ],
    );

    archiver.append(this.formatCsvBuffer(csv.headers, csv.rows), {
      name: `${userId}/appointments.csv`,
    });
    return { filename: "appointments.csv", csv };
  }

  private async addUserMessages(
    userId: string,
    archiver: Archiver,
  ): Promise<UserCsvExport> {
    const messages = await this.databaseService.getQuery((collections) =>
      collections.userMessages(userId),
    );

    const csv = this.createCsvData(
      [
        "id",
        "type",
        "title",
        "action",
        "reference",
        "creationDate",
        "completionDate",
        "dueDate",
      ],
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
      ],
    );

    archiver.append(this.formatCsvBuffer(csv.headers, csv.rows), {
      name: `${userId}/messages.csv`,
    });
    return { filename: "messages.csv", csv };
  }

  private async addUserMedicationRequests(
    userId: string,
    archiver: Archiver,
  ): Promise<UserCsvExport> {
    const liveDocs = await this.databaseService.getQuery((collections) =>
      collections.userMedicationRequests(userId),
    );
    const records = await this.lifecycleRecords(
      userId,
      "medicationRequests",
      liveDocs,
      (data) => fhirMedicationRequestConverter.value.schema.parse(data),
    );

    const csv = this.createCsvData(
      [
        "id",
        "medicationCode (RxNorm)",
        "drugCode (RxNorm)",
        "quantity",
        "quantityUnit",
        "frequencyPerDay",
        "created",
        "lastUpdated",
        "removed",
      ],
      records,
      (record) => {
        const medication = record.content;
        const referenceParts = (
          medication.medicationReference?.reference ?? ""
        ).split("/");
        const quantity = medication.dosageInstruction
          ?.at(0)
          ?.doseAndRate?.at(0)?.doseQuantity;
        const frequency =
          medication.dosageInstruction?.at(0)?.timing?.repeat?.frequency;
        return [
          record.id,
          referenceParts[1],
          referenceParts[3],
          quantity?.value?.toString() ?? "",
          quantity?.unit ?? "",
          frequency?.toString() ?? "",
          record.created?.toISOString() ?? "",
          record.lastUpdated?.toISOString() ?? "",
          record.removed?.toISOString() ?? "",
        ];
      },
    );

    archiver.append(this.formatCsvBuffer(csv.headers, csv.rows), {
      name: `${userId}/medicationRequests.csv`,
    });
    return { filename: "medicationRequests.csv", csv };
  }

  /**
   * Reconstructs the lifecycle of every document in a user's sub-collection by
   * reading the global `/history` collection (range-queried by document path)
   * and merging it with the live collection. Returns one record per document:
   * - `created`: earliest history entry date (empty if the doc predates history
   *   tracking and only exists live).
   * - `lastUpdated`: latest history entry with non-null data.
   * - `removed`: date the document was deleted (it no longer exists live).
   * - `content`: the live content if it still exists, otherwise the most recent
   *   non-null history snapshot parsed back into the model.
   */
  private async lifecycleRecords<Content>(
    userId: string,
    subcollection: string,
    liveDocs: Array<Document<Content>>,
    parse: (data: unknown) => Content,
  ): Promise<Array<LifecycleRecord<Content>>> {
    const prefix = `users/${userId}/${subcollection}/`;
    const historyEntries = await this.databaseService.getQuery((collections) =>
      collections.history
        .where("path", ">=", prefix)
        .where("path", "<", prefix + "\uf8ff"),
    );

    const groups = new Map<string, Array<{ date: Date; data: unknown }>>();
    for (const entry of historyEntries) {
      const group = groups.get(entry.content.path) ?? [];
      group.push({ date: entry.content.date, data: entry.content.data });
      groups.set(entry.content.path, group);
    }

    const liveById = new Map(liveDocs.map((doc) => [doc.id, doc]));
    const records: Array<LifecycleRecord<Content>> = [];
    const seenIds = new Set<string>();

    for (const [path, entries] of groups) {
      const id = path.substring(path.lastIndexOf("/") + 1);
      seenIds.add(id);
      entries.sort((a, b) => a.date.getTime() - b.date.getTime());

      const nonNullEntries = entries.filter((entry) => entry.data != null);
      const created = entries.at(0)?.date;
      const lastUpdated = nonNullEntries.at(-1)?.date;
      const liveDoc = liveById.get(id);

      let content: Content | undefined;
      let removed: Date | undefined;
      if (liveDoc !== undefined) {
        content = liveDoc.content;
      } else {
        const latestData = nonNullEntries.at(-1)?.data;
        content = latestData != null ? parse(latestData) : undefined;
        removed = entries.at(-1)?.date;
      }

      // No recoverable data (e.g. only a deletion entry exists) - skip.
      if (content === undefined) continue;

      records.push({ id, content, created, lastUpdated, removed });
    }

    // Include live documents that predate history tracking (no history entries).
    for (const doc of liveDocs) {
      if (seenIds.has(doc.id)) continue;
      records.push({ id: doc.id, content: doc.content });
    }

    return records;
  }

  private async addUserObservations(
    userId: string,
    collection: UserObservationCollection,
    archiver: Archiver,
  ): Promise<UserCsvExport> {
    const observations = await this.databaseService.getQuery((collections) =>
      collections.userObservations(userId, collection),
    );

    let csv: CsvData;
    switch (collection) {
      case UserObservationCollection.bloodPressure:
        csv = this.createCsvData(
          [
            "id",
            "systolicValue",
            "systolicUnit",
            "diastolicValue",
            "diastolicUnit",
            "effectiveDateTime",
          ],
          observations,
          (value) => {
            const systolicComponent = value.content.component?.find(
              (component) =>
                component.code.coding?.some(
                  (coding) => coding.code === LoincCode.systolicBloodPressure,
                ),
            );
            const diastolicComponent = value.content.component?.find(
              (component) =>
                component.code.coding?.some(
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
          },
        );
        break;
      default:
        csv = this.createCsvData(
          ["id", "value", "unit", "effectiveDateTime"],
          observations,
          (value) => [
            value.id,
            value.content.valueQuantity?.value?.toString() ?? "",
            value.content.valueQuantity?.unit ?? "",
            value.content.effectiveDateTime?.toISOString() ?? "",
          ],
        );
        break;
    }
    archiver.append(this.formatCsvBuffer(csv.headers, csv.rows), {
      name: `${userId}/${collection}.csv`,
    });
    return { filename: `${collection}.csv`, csv };
  }

  private async addUserQuestionnaireResponses(
    userId: string,
    archiver: Archiver,
  ): Promise<UserCsvExport> {
    const questionnaireResponses = await this.databaseService.getQuery(
      (collections) => collections.userQuestionnaireResponses(userId),
    );

    const kccqResponses = questionnaireResponses.filter(
      (response) =>
        response.content.questionnaire ===
        QuestionnaireLinkId.url(QuestionnaireId.kccq),
    );

    const csv = this.createCsvData(
      [
        "id",
        "q1a",
        "q1b",
        "q1c",
        "q2",
        "q3",
        "q4",
        "q5",
        "q6",
        "q7",
        "q8a",
        "q8b",
        "q8c",
        "q9",
        "authored",
      ],
      kccqResponses,
      (value) => {
        return [
          value.id,
          value.content
            .leafResponseItem(QuestionnaireLinkId.kccq.question1a)
            ?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content
            .leafResponseItem(QuestionnaireLinkId.kccq.question1b)
            ?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content
            .leafResponseItem(QuestionnaireLinkId.kccq.question1c)
            ?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content
            .leafResponseItem(QuestionnaireLinkId.kccq.question2)
            ?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content
            .leafResponseItem(QuestionnaireLinkId.kccq.question3)
            ?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content
            .leafResponseItem(QuestionnaireLinkId.kccq.question4)
            ?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content
            .leafResponseItem(QuestionnaireLinkId.kccq.question5)
            ?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content
            .leafResponseItem(QuestionnaireLinkId.kccq.question6)
            ?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content
            .leafResponseItem(QuestionnaireLinkId.kccq.question7)
            ?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content
            .leafResponseItem(QuestionnaireLinkId.kccq.question8a)
            ?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content
            .leafResponseItem(QuestionnaireLinkId.kccq.question8b)
            ?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content
            .leafResponseItem(QuestionnaireLinkId.kccq.question8c)
            ?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content
            .leafResponseItem(QuestionnaireLinkId.kccq.question9)
            ?.answer?.at(0)?.valueCoding?.code ?? "",
          value.content.authored?.toISOString() ?? "",
        ];
      },
    );

    archiver.append(this.formatCsvBuffer(csv.headers, csv.rows), {
      name: `${userId}/questionnaireResponses_kccq.csv`,
    });
    return { filename: "questionnaireResponses_kccq.csv", csv };
  }

  private async addUserSymptomScores(
    userId: string,
    archiver: Archiver,
  ): Promise<UserCsvExport> {
    const symptomScores = await this.databaseService.getQuery((collections) =>
      collections.userSymptomScores(userId),
    );

    const csv = this.createCsvData(
      [
        "id",
        "overallScore",
        "physicalLimitsScore",
        "socialLimitsScore",
        "symptomFrequencyScore",
        "qualityOfLifeScore",
        "dizzinessScore",
        "date",
        "questionnaireResponseId",
      ],
      symptomScores,
      (value) => [
        value.id,
        value.content.overallScore.toString(),
        value.content.physicalLimitsScore?.toString() ?? "",
        value.content.socialLimitsScore?.toString() ?? "",
        value.content.symptomFrequencyScore?.toString() ?? "",
        value.content.qualityOfLifeScore?.toString() ?? "",
        value.content.dizzinessScore.toString(),
        value.content.date.toISOString(),
        value.content.questionnaireResponseId ?? "",
      ],
    );

    archiver.append(this.formatCsvBuffer(csv.headers, csv.rows), {
      name: `${userId}/symptomScores.csv`,
    });
    return { filename: "symptomScores.csv", csv };
  }

  // Helpers - File Creation

  private createCsvData<T>(
    headers: readonly string[],
    values: T[],
    row: (item: T) => string[],
  ): CsvData {
    return { headers, rows: values.map(row) };
  }

  private formatCsvBuffer(
    headers: readonly string[],
    rows: ReadonlyArray<readonly string[]>,
  ): Buffer {
    function escapeCsvField(field: string): string {
      if (/^[=+\-@]/.test(field)) {
        field = "'" + field;
      }
      if (/[;\n"]/.test(field)) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    }

    const string = [
      headers.map(escapeCsvField).join(";"),
      ...rows.map((row) => row.map(escapeCsvField).join(";")),
    ].join("\n");
    return Buffer.from(string);
  }

  private async createZipBuffer(
    generate: (archiver: Archiver) => Promise<void>,
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
