//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { FHIRQuestionnaireResponse } from '@stanfordbdhg/engagehf-models'
import {
  QuestionnaireResponse,
  QuestionnaireResponseService,
} from './questionnaireResponseService.js'
import { SymptomScoreCalculator } from './symptomScore/symptomScoreCalculator.js'

export class DefaultQuestionnaireResponseService
  implements QuestionnaireResponseService
{
  // Properties

  private readonly symptomScoreCalculator: SymptomScoreCalculator

  // Constructor

  constructor(symptomScoreCalculator: SymptomScoreCalculator) {
    this.symptomScoreCalculator = symptomScoreCalculator
  }

  // Methods

  async extract(
    response: FHIRQuestionnaireResponse,
  ): Promise<QuestionnaireResponse> {
    const symptomScore = this.symptomScoreCalculator.calculate(response)
    return {
      symptomScore: symptomScore,
      creatinine: null,
      estimatedGlomerularFiltrationRate: null,
      potassium: null,
    }
  }
}
