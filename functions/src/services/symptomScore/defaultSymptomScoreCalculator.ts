//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type SymptomScoreCalculator } from './symptomScoreCalculator.js'
import { average } from '../../extensions/array.js'
import { type FHIRQuestionnaireResponse } from '../../models/fhir/questionnaireResponse.js'
import { type SymptomScore } from '../../models/symptomScore.js'
import { type FhirService } from '../fhir/fhirService.js'

export class DefaultSymptomScoreCalculator implements SymptomScoreCalculator {
  // Properties

  private readonly fhirService: FhirService

  // Constructor

  constructor(fhirService: FhirService) {
    this.fhirService = fhirService
  }

  // Methods

  calculate(questionnaireResponse: FHIRQuestionnaireResponse): SymptomScore {
    const response = this.fhirService.symptomQuestionnaireResponse(
      questionnaireResponse,
    )

    const result: SymptomScore = {
      questionnaireResponseId: questionnaireResponse.id,
      date: questionnaireResponse.authored,
      overallScore: 0,
      socialLimitsScore: undefined,
      physicalLimitsScore: undefined,
      qualityOfLifeScore: undefined,
      symptomFrequencyScore: undefined,
      dizzinessScore: response.answer9,
    }

    const q1NonMissing = [
      response.answer1a,
      response.answer1b,
      response.answer1c,
    ].filter((x) => x !== 6)
    const q1Average = average(q1NonMissing)
    if (q1Average && q1NonMissing.length >= 2) {
      result.physicalLimitsScore = (100 * (q1Average - 1)) / 4
    }

    const symptomFrequencyAverage = average([
      (response.answer2 - 1) / 4,
      (response.answer3 - 1) / 6,
      (response.answer4 - 1) / 6,
      (response.answer5 - 1) / 4,
    ])
    if (symptomFrequencyAverage)
      result.symptomFrequencyScore = 100 * symptomFrequencyAverage

    const qualityOfLifeAverage = average([response.answer6, response.answer7])
    if (qualityOfLifeAverage)
      result.qualityOfLifeScore = (100 * (qualityOfLifeAverage - 1)) / 4

    const q8NonMissing = [
      response.answer8a,
      response.answer8b,
      response.answer8c,
    ].filter((x) => x !== 6)
    const q8Average = average(q8NonMissing)
    if (q8Average && q8NonMissing.length >= 1)
      result.socialLimitsScore = (100 * (q8Average - 1)) / 4

    const nonMissingScores = [
      result.physicalLimitsScore,
      result.symptomFrequencyScore,
      result.qualityOfLifeScore,
      result.socialLimitsScore,
    ].flatMap((score) => (score ? [score] : []))
    const totalScore = average(nonMissingScores)
    if (totalScore) result.overallScore = Math.round(totalScore)

    if (result.physicalLimitsScore)
      result.physicalLimitsScore = Math.round(result.physicalLimitsScore)
    if (result.symptomFrequencyScore)
      result.symptomFrequencyScore = Math.round(result.symptomFrequencyScore)
    if (result.qualityOfLifeScore)
      result.qualityOfLifeScore = Math.round(result.qualityOfLifeScore)
    if (result.socialLimitsScore)
      result.socialLimitsScore = Math.round(result.socialLimitsScore)
    return result
  }
}
