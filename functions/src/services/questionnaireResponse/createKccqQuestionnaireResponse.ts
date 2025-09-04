//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  FHIRQuestionnaireResponse,
  type SymptomQuestionnaireResponse,
} from "@stanfordbdhg/engagehf-models";
import { QuestionnaireLinkId } from "../seeding/staticData/questionnaireFactory/questionnaireLinkIds.js";

export function createKccqQuestionnaireResponse(
  input: SymptomQuestionnaireResponse,
): FHIRQuestionnaireResponse {
  const linkIds = QuestionnaireLinkId.kccq;

  const items: Record<string, number> = {
    [linkIds.question1a]: input.answer1a,
    [linkIds.question1b]: input.answer1b,
    [linkIds.question1c]: input.answer1c,
    [linkIds.question2]: input.answer2,
    [linkIds.question3]: input.answer3,
    [linkIds.question4]: input.answer4,
    [linkIds.question5]: input.answer5,
    [linkIds.question6]: input.answer6,
    [linkIds.question7]: input.answer7,
    [linkIds.question8a]: input.answer8a,
    [linkIds.question8b]: input.answer8b,
    [linkIds.question8c]: input.answer8c,
    [linkIds.question9]: input.answer9,
  };

  return new FHIRQuestionnaireResponse({
    id: input.questionnaireResponse,
    questionnaire: input.questionnaire,
    authored: input.date,
    item: Object.entries(items).map((entry) => ({
      linkId: entry[0],
      answer: [
        {
          valueCoding: {
            code: entry[1].toString(),
          },
        },
      ],
    })),
  });
}
