//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type FHIRQuestionnaireResponse } from '@stanfordbdhg/engagehf-models'
import { createKccqQuestionnaireResponse } from '../../services/questionnaireResponse/createKccqQuestionnaireResponse.js'
import {
  QuestionnaireId,
  QuestionnaireLinkId,
} from '../../services/seeding/staticData/questionnaireFactory/questionnaireLinkIds.js'

export function mockQuestionnaireResponse(): FHIRQuestionnaireResponse {
  return createKccqQuestionnaireResponse({
    questionnaire: QuestionnaireLinkId.url(QuestionnaireId.kccq),
    questionnaireResponse: '60193B69-B0F7-4708-8CCE-F3CB2936628D',
    date: new Date('2024-07-18T18:46:37.219581961-07:00'),
    answer1a: 1,
    answer1b: 4,
    answer1c: 3,
    answer2: 2,
    answer3: 3,
    answer4: 4,
    answer5: 5,
    answer6: 3,
    answer7: 4,
    answer8a: 2,
    answer8b: 4,
    answer8c: 4,
    answer9: 3,
  })
}
