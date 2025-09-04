//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  SymptomScore,
  UserMessage,
  UserMessageType,
  type FhirQuestionnaireResponse,
} from "@stanfordbdhg/engagehf-models";
import { QuestionnaireResponseService } from "./questionnaireResponseService.js";
import { type SymptomScoreCalculator } from "./symptomScore/symptomScoreCalculator.js";
import { type Document } from "../database/databaseService.js";
import { type MessageService } from "../message/messageService.js";
import { type PatientService } from "../patient/patientService.js";
import {
  QuestionnaireId,
  QuestionnaireLinkId,
} from "../seeding/staticData/questionnaireFactory/questionnaireLinkIds.js";
import { type UserService } from "../user/userService.js";

export class KccqQuestionnaireResponseService extends QuestionnaireResponseService {
  // Properties

  private readonly messageService: MessageService;
  private readonly patientService: PatientService;
  private readonly symptomScoreCalculator: SymptomScoreCalculator;
  private readonly userService: UserService;

  // Constructor

  constructor(input: {
    messageService: MessageService;
    patientService: PatientService;
    symptomScoreCalculator: SymptomScoreCalculator;
    userService: UserService;
  }) {
    super();
    this.messageService = input.messageService;
    this.patientService = input.patientService;
    this.symptomScoreCalculator = input.symptomScoreCalculator;
    this.userService = input.userService;
  }

  // Methods

  async handle(
    userId: string,
    response: Document<FhirQuestionnaireResponse>,
    options: { isNew: boolean },
  ): Promise<boolean> {
    const urls = [QuestionnaireLinkId.url(QuestionnaireId.kccq)];
    if (!urls.includes(response.content.value.questionnaire ?? ""))
      return false;

    const symptomScore = this.symptomScore(response.content);
    if (symptomScore === null) return false;
    const previousSymptomScore =
      await this.patientService.getLatestSymptomScore(userId);

    await this.patientService.updateSymptomScore(
      userId,
      response.id,
      symptomScore,
    );

    if (
      previousSymptomScore !== undefined &&
      symptomScore.overallScore < previousSymptomScore.content.overallScore - 10
    ) {
      let userName: string | undefined = undefined;
      try {
        userName = (await this.userService.getAuth(userId)).displayName;
      } catch (error) {
        console.error(
          `Failed to get user name for userId ${userId}: ${String(error)}`,
        );
        userName = undefined;
      }
      const message = UserMessage.createKccqDeclineForClinician({
        userId: userId,
        reference: response.id,
        userName,
      });
      await this.messageService.addMessageForClinicianAndOwners(
        userId,
        message,
        { notify: true, user: null },
      );
    }

    if (options.isNew) {
      await this.messageService.completeMessages(
        userId,
        UserMessageType.symptomQuestionnaire,
      );
    }

    return true;
  }

  // Helpers

  private symptomScore(
    response: FhirQuestionnaireResponse,
  ): SymptomScore | null {
    const linkIds = QuestionnaireLinkId.kccq;

    const input = {
      answer1a: this.uniqueIntCodingAnswer(linkIds.question1a, response),
      answer1b: this.uniqueIntCodingAnswer(linkIds.question1b, response),
      answer1c: this.uniqueIntCodingAnswer(linkIds.question1c, response),
      answer2: this.uniqueIntCodingAnswer(linkIds.question2, response),
      answer3: this.uniqueIntCodingAnswer(linkIds.question3, response),
      answer4: this.uniqueIntCodingAnswer(linkIds.question4, response),
      answer5: this.uniqueIntCodingAnswer(linkIds.question5, response),
      answer6: this.uniqueIntCodingAnswer(linkIds.question6, response),
      answer7: this.uniqueIntCodingAnswer(linkIds.question7, response),
      answer8a: this.uniqueIntCodingAnswer(linkIds.question8a, response),
      answer8b: this.uniqueIntCodingAnswer(linkIds.question8b, response),
      answer8c: this.uniqueIntCodingAnswer(linkIds.question8c, response),
      answer9: this.uniqueIntCodingAnswer(linkIds.question9, response),
    };

    return new SymptomScore({
      date: response.authoredDate ?? new Date(),
      ...this.symptomScoreCalculator.calculate(input),
    });
  }

  private uniqueIntCodingAnswer(
    linkId: string,
    response: FhirQuestionnaireResponse,
  ): number {
    const answers = response.uniqueLeafResponseItem(linkId)?.answer ?? [];
    if (answers.length !== 1) {
      throw new Error(
        `Expected exactly one answer for leaf response item with linkId '${linkId}', but found ${answers.length}.`,
      );
    }
    const code = answers[0].valueCoding?.code;
    if (code === undefined) {
      throw new Error(
        `Expected a code for leaf response item with linkId '${linkId}', but found none.`,
      );
    }
    return parseInt(code, 10);
  }
}
