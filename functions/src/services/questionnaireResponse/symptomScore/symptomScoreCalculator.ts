//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { average } from '@stanfordbdhg/engagehf-models'

export interface SymptomScoreCalculatorInput {
  answer1a: number
  answer1b: number
  answer1c: number
  answer2: number
  answer3: number
  answer4: number
  answer5: number
  answer6: number
  answer7: number
  answer8a: number
  answer8b: number
  answer8c: number
  answer9: number
}

export interface SymptomScoreCalculatorOutput {
  overallScore: number
  physicalLimitsScore: number | undefined
  socialLimitsScore: number | undefined
  qualityOfLifeScore: number | undefined
  symptomFrequencyScore: number | undefined
  dizzinessScore: number
}

export class SymptomScoreCalculator {
  calculate(input: SymptomScoreCalculatorInput): SymptomScoreCalculatorOutput {
    const result = {
      overallScore: 0,
      socialLimitsScore: undefined as number | undefined,
      physicalLimitsScore: undefined as number | undefined,
      qualityOfLifeScore: undefined as number | undefined,
      symptomFrequencyScore: undefined as number | undefined,
      dizzinessScore: input.answer9,
    }

    const physicalLimitsAnswers = [
      input.answer1a,
      input.answer1b,
      input.answer1c,
    ]
      .filter((x) => x !== 6)
      .map((x) => (100 * (x - 1)) / 4)

    result.physicalLimitsScore =
      physicalLimitsAnswers.length >= 2 ?
        average(physicalLimitsAnswers)
      : undefined

    const symptomFrequencyAnswers = [
      (input.answer2 - 1) / 4,
      (input.answer3 - 1) / 6,
      (input.answer4 - 1) / 6,
      (input.answer5 - 1) / 4,
    ].map((x) => x * 100)

    result.symptomFrequencyScore = average(symptomFrequencyAnswers)

    const qualityOfLifeAnswers = [input.answer6, input.answer7].map(
      (x) => (100 * (x - 1)) / 4,
    )
    result.qualityOfLifeScore = average(qualityOfLifeAnswers)

    const socialLimitsAnswers = [input.answer8a, input.answer8b, input.answer8c]
      .filter((x) => x !== 6)
      .map((x) => (100 * (x - 1)) / 4)

    result.socialLimitsScore =
      socialLimitsAnswers.length >= 2 ? average(socialLimitsAnswers) : undefined

    const domainScores = [
      result.physicalLimitsScore,
      result.symptomFrequencyScore,
      result.qualityOfLifeScore,
      result.socialLimitsScore,
    ].flatMap((score) => (score !== undefined ? [score] : []))
    result.overallScore = average(domainScores) ?? 0

    return result
  }
}
