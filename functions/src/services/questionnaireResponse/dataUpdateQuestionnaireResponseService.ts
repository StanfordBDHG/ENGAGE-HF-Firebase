//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type User,
  UserMessageType,
  type FHIRQuestionnaireResponse,
} from "@stanfordbdhg/engagehf-models";
import { logger } from "firebase-functions/v2";
import { QuestionnaireResponseService } from "./questionnaireResponseService.js";
import { type Document } from "../database/databaseService.js";
import { type MessageService } from "../message/messageService.js";
import { type PatientService } from "../patient/patientService.js";
import {
  QuestionnaireId,
  QuestionnaireLinkId,
} from "../seeding/staticData/questionnaireFactory/questionnaireLinkIds.js";
import { type UserService } from "../user/userService.js";
import { type EgfrCalculator } from "./egfr/egfrCalculator.js";

export class DataUpdateQuestionnaireResponseService extends QuestionnaireResponseService {
  // Properties

  private readonly egfrCalculator: EgfrCalculator;
  private readonly messageService: MessageService;
  private readonly patientService: PatientService;
  private readonly userService: UserService;

  // Constructor

  constructor(input: {
    egfrCalculator: EgfrCalculator;
    messageService: MessageService;
    patientService: PatientService;
    userService: UserService;
  }) {
    super();
    this.egfrCalculator = input.egfrCalculator;
    this.messageService = input.messageService;
    this.patientService = input.patientService;
    this.userService = input.userService;
  }

  // Methods

  async handle(
    userId: string,
    response: Document<FHIRQuestionnaireResponse>,
    options: { isNew: boolean },
  ): Promise<boolean> {
    const postAppointmentUrl = QuestionnaireLinkId.url(
      QuestionnaireId.postAppointment,
    );
    const urls = [
      QuestionnaireLinkId.url(QuestionnaireId.dataUpdate),
      postAppointmentUrl,
    ];
    if (!urls.includes(response.content.data.questionnaire ?? "")) {
      logger.info(
        `${this.constructor.name}.handle(${userId}): Url ${response.content.data.questionnaire} is not a data update / post appointment questionnaire, skipping.`,
      );
      return false;
    }

    let user: User | null;
    try {
      user = (await this.userService.getUser(userId))?.content ?? null;
    } catch (error) {
      logger.error(`Failed to fetch user ${userId}:`, error);
      user = null;
    }

    await this.handleLabValues({
      userId,
      response,
      dateOfBirth: user?.dateOfBirth ?? null,
      sex: user?.sex ?? null,
      egfrCalculator: this.egfrCalculator,
      patientService: this.patientService,
    });

    await this.handleMedicationRequests({
      userId,
      response,
      patientService: this.patientService,
    });

    const appointment = this.extractAppointment(userId, response.content);
    logger.info(
      `${this.constructor.name}.handle(${userId}): Extracted appointment: ${appointment !== null}`,
    );
    if (appointment !== null) {
      await this.patientService.createAppointment(userId, appointment);
      logger.info(
        `${this.constructor.name}.handle(${userId}): Successfully created appointment`,
      );
    }

    if (
      options.isNew &&
      response.content.data.questionnaire === postAppointmentUrl
    ) {
      logger.info(
        `${this.constructor.name}.handle(${userId}): About to complete post appointment questionnaire messages.`,
      );
      await this.messageService.completeMessages(
        userId,
        UserMessageType.postAppointmentQuestionnaire,
      );
    }
    return true;
  }
}
