//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type SymptomScoreCalculator } from './symptomScoreCalculator.js'
import { average } from '../../extensions/array.js'
import { type FHIRQuestionnaireResponse } from '../../models/fhir/fhirQuestionnaireResponse.js'
import { SymptomScore } from '../../models/types/symptomScore.js'

export class DefaultSymptomScoreCalculator implements SymptomScoreCalculator {
  // Methods

  calculate(questionnaireResponse: FHIRQuestionnaireResponse): SymptomScore {
    const response = questionnaireResponse.symptomQuestionnaireResponse

    const result = {
      questionnaireResponseId: questionnaireResponse.id,
      date: questionnaireResponse.authored,
      overallScore: 0,
      socialLimitsScore: undefined as number | undefined,
      physicalLimitsScore: undefined as number | undefined,
      qualityOfLifeScore: undefined as number | undefined,
      symptomFrequencyScore: undefined as number | undefined,
      dizzinessScore: response.answer9,
    }

    const q1NonMissing = [
      response.answer1a,
      response.answer1b,
      response.answer1c,
    ].filter((x) => x !== 6)
    const q1Average = average(q1NonMissing)
    if (q1Average !== undefined && q1NonMissing.length >= 2)
      result.physicalLimitsScore = (100 * (q1Average - 1)) / 4

    const symptomFrequencyAverage = average(
      [
        (response.answer2 - 1) / 4,
        (response.answer3 - 1) / 6,
        (response.answer4 - 1) / 6,
        (response.answer5 - 1) / 4,
      ].map((x) => x * 100),
    )
    if (symptomFrequencyAverage !== undefined)
      result.symptomFrequencyScore = symptomFrequencyAverage

    const qualityOfLifeAverage = average([response.answer6, response.answer7])
    if (qualityOfLifeAverage !== undefined)
      result.qualityOfLifeScore = (100 * (qualityOfLifeAverage - 1)) / 4

    const q8NonMissing = [
      response.answer8a,
      response.answer8b,
      response.answer8c,
    ].filter((x) => x !== 6)
    const q8Average = average(q8NonMissing)
    if (q8Average !== undefined && q8NonMissing.length >= 2)
      result.socialLimitsScore = (100 * (q8Average - 1)) / 4

    const nonMissingScores = [
      result.physicalLimitsScore,
      result.symptomFrequencyScore,
      result.qualityOfLifeScore,
      result.socialLimitsScore,
    ].flatMap((score) => (score !== undefined ? [score] : []))
    const totalScore = average(nonMissingScores)
    if (totalScore !== undefined) result.overallScore = totalScore

    return new SymptomScore(result)
  }
}
