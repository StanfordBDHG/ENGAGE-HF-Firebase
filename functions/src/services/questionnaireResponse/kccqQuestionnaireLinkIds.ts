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
} from '@stanfordbdhg/engagehf-models'

interface KccqQuestionnaireLinkIds {
  question1a: string
  question1b: string
  question1c: string
  question2: string
  question3: string
  question4: string
  question5: string
  question6: string
  question7: string
  question8a: string
  question8b: string
  question8c: string
  question9: string
}

export function symptomQuestionnaireLinkIds(
  questionnaire: string,
): KccqQuestionnaireLinkIds | null {
  return linkIdMap.get(questionnaire) ?? null
}

const linkIdMap = new Map<string, KccqQuestionnaireLinkIds>([
  [
    'http://spezi.health/fhir/questionnaire/9528ccc2-d1be-4c4c-9c3c-19f78e51ec19',
    {
      question1a: 'a459b804-35bf-4792-f1eb-0b52c4e176e1',
      question1b: 'cf9c5031-1ed5-438a-fc7d-dc69234015a0',
      question1c: '1fad0f81-b2a9-4c8f-9a78-4b2a5d7aef07',
      question2: '692bda7d-a616-43d1-8dc6-8291f6460ab2',
      question3: 'b1734b9e-1d16-4238-8556-5ae3fa0ba913',
      question4: '57f37fb3-a0ad-4b1f-844e-3f67d9b76946',
      question5: '396164df-d045-4c56-d710-513297bdc6f2',
      question6: '75e3f62e-e37d-48a2-f4d9-af2db8922da0',
      question7: 'fce3a16e-c6d8-4bac-8ab5-8f4aee4adc08',
      question8a: '8b022e69-127d-4447-8190-39ac645e60e1',
      question8b: '1eee7259-da1c-4cba-80a9-e67e684573a1',
      question8c: '883a22a8-2f6e-4b41-84b7-0028ed543192',
      question9: '24108967-2ff3-40d0-c54f-a7b97bb84d05',
    },
  ],
])

export function createKccqQuestionnaireResponse(
  input: SymptomQuestionnaireResponse,
): FHIRQuestionnaireResponse {
  const linkIds = symptomQuestionnaireLinkIds(input.questionnaire)
  if (linkIds === null) throw new Error('Invalid questionnaire')

  return new FHIRQuestionnaireResponse({
    id: input.questionnaireResponse,
    questionnaire: input.questionnaire,
    authored: input.date,
    item: [
      {
        linkId: linkIds.question1a,
        answer: [
          {
            valueCoding: {
              code: input.answer1a.toString(),
            },
          },
        ],
      },
      {
        linkId: linkIds.question1b,
        answer: [
          {
            valueCoding: {
              code: input.answer1b.toString(),
            },
          },
        ],
      },
      {
        linkId: linkIds.question1c,
        answer: [
          {
            valueCoding: {
              code: input.answer1c.toString(),
            },
          },
        ],
      },
      {
        linkId: linkIds.question2,
        answer: [
          {
            valueCoding: {
              code: input.answer2.toString(),
            },
          },
        ],
      },
      {
        linkId: linkIds.question3,
        answer: [
          {
            valueCoding: {
              code: input.answer3.toString(),
            },
          },
        ],
      },
      {
        linkId: linkIds.question4,
        answer: [
          {
            valueCoding: {
              code: input.answer4.toString(),
            },
          },
        ],
      },
      {
        linkId: linkIds.question5,
        answer: [
          {
            valueCoding: {
              code: input.answer5.toString(),
            },
          },
        ],
      },
      {
        linkId: linkIds.question6,
        answer: [
          {
            valueCoding: {
              code: input.answer6.toString(),
            },
          },
        ],
      },
      {
        linkId: linkIds.question7,
        answer: [
          {
            valueCoding: {
              code: input.answer7.toString(),
            },
          },
        ],
      },
      {
        linkId: linkIds.question8a,
        answer: [
          {
            valueCoding: {
              code: input.answer8a.toString(),
            },
          },
        ],
      },
      {
        linkId: linkIds.question8b,
        answer: [
          {
            valueCoding: {
              code: input.answer8b.toString(),
            },
          },
        ],
      },
      {
        linkId: linkIds.question8c,
        answer: [
          {
            valueCoding: {
              code: input.answer8c.toString(),
            },
          },
        ],
      },
      {
        linkId: linkIds.question9,
        answer: [
          {
            valueCoding: {
              code: input.answer9.toString(),
            },
          },
        ],
      },
    ],
  })
}
