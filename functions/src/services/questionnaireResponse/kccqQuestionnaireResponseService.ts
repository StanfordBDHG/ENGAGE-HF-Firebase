//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  SymptomScore,
  UserMessageType,
  type FHIRQuestionnaireResponse,
} from '@stanfordbdhg/engagehf-models'
import { QuestionnaireResponseService } from './questionnaireResponseService.js'
import { type SymptomScoreCalculator } from './symptomScore/symptomScoreCalculator.js'
import { type Document } from '../database/databaseService.js'
import { type PatientService } from '../patient/patientService.js'
import {
  QuestionnaireId,
  QuestionnaireLinkId,
} from '../seeding/staticData/questionnaireFactory/questionnaireLinkIds.js'
import { MessageService } from '../message/messageService.js'

export class KccqQuestionnaireResponseService extends QuestionnaireResponseService {
  // Properties

  private readonly messageService: MessageService
  private readonly patientService: PatientService
  private readonly symptomScoreCalculator: SymptomScoreCalculator

  // Constructor

  constructor(input: {
    messageService: MessageService
    patientService: PatientService
    symptomScoreCalculator: SymptomScoreCalculator
  }) {
    super()
    this.messageService = input.messageService
    this.patientService = input.patientService
    this.symptomScoreCalculator = input.symptomScoreCalculator
  }

  // Methods

  async handle(
    userId: string,
    response: Document<FHIRQuestionnaireResponse>,
    options: { isNew: boolean },
  ): Promise<boolean> {
    const urls = [QuestionnaireLinkId.url(QuestionnaireId.kccq)]
    if (!urls.includes(response.content.questionnaire)) return false

    const symptomScore = this.symptomScore(response.content)
    if (symptomScore === null) return false

    await this.patientService.updateSymptomScore(
      userId,
      response.id,
      symptomScore,
    )

    if (options.isNew) {
      await this.messageService.completeMessages(
        userId,
        UserMessageType.symptomQuestionnaire,
      )
    }

    return true
  }

  // Helpers

  private symptomScore(
    response: FHIRQuestionnaireResponse,
  ): SymptomScore | null {
    const linkIds = QuestionnaireLinkId.kccq

    const input = {
      answer1a: this.singleIntCodingAnswer(linkIds.question1a, response),
      answer1b: this.singleIntCodingAnswer(linkIds.question1b, response),
      answer1c: this.singleIntCodingAnswer(linkIds.question1c, response),
      answer2: this.singleIntCodingAnswer(linkIds.question2, response),
      answer3: this.singleIntCodingAnswer(linkIds.question3, response),
      answer4: this.singleIntCodingAnswer(linkIds.question4, response),
      answer5: this.singleIntCodingAnswer(linkIds.question5, response),
      answer6: this.singleIntCodingAnswer(linkIds.question6, response),
      answer7: this.singleIntCodingAnswer(linkIds.question7, response),
      answer8a: this.singleIntCodingAnswer(linkIds.question8a, response),
      answer8b: this.singleIntCodingAnswer(linkIds.question8b, response),
      answer8c: this.singleIntCodingAnswer(linkIds.question8c, response),
      answer9: this.singleIntCodingAnswer(linkIds.question9, response),
    }

    return new SymptomScore({
      date: response.authored ?? new Date(),
      ...this.symptomScoreCalculator.calculate(input),
    })
  }

  private singleIntCodingAnswer(
    linkId: string,
    response: FHIRQuestionnaireResponse,
  ): number {
    const answers = response.leafResponseItem(linkId)?.answer ?? []
    if (answers.length !== 1) {
      throw new Error(
        `Expected exactly one answer for leaf response item with linkId '${linkId}', but found ${answers.length}.`,
      )
    }
    const code = answers[0].valueCoding?.code
    if (code === undefined) {
      throw new Error(
        `Expected a code for leaf response item with linkId '${linkId}', but found none.`,
      )
    }
    return parseInt(code, 10)
  }
}
