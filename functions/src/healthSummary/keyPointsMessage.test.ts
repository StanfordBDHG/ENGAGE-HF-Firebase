//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { LocalizedText } from '@stanfordbdhg/engagehf-models'
import {
  HealthSummaryDizzinessCategory,
  type HealthSummaryKeyPointMessage,
  healthSummaryKeyPointMessages,
  healthSummaryKeyPointTexts,
  HealthSummaryMedicationRecommendationsCategory,
  HealthSummarySymptomScoreCategory,
  HealthSummaryWeightCategory,
} from './keyPointsMessage.js'
import { readCsv } from '../tests/helpers/csv.js'

describe('keyPointsMessage', () => {
  it('should generate the key point message json', () => {
    const keyPointMessages: HealthSummaryKeyPointMessage[] = []
    readCsv('src/tests/resources/keyPointMessages.csv', 106, (line, index) => {
      if (index === 0) return

      const recommendations =
        Object.values(HealthSummaryMedicationRecommendationsCategory).find(
          (category) => line[0] === (category as string),
        ) ?? null
      const symptoms =
        Object.values(HealthSummarySymptomScoreCategory).find(
          (category) => line[1] === (category as string),
        ) ?? null
      const dizziness =
        Object.values(HealthSummaryDizzinessCategory).find(
          (category) => line[2] === (category as string),
        ) ?? null
      const weight =
        Object.values(HealthSummaryWeightCategory).find(
          (category) => line[3] === (category as string),
        ) ?? null
      const texts = separateKeyPointTexts(line[4]).map((text) =>
        LocalizedText.create({ en: text }),
      )

      expect(recommendations).not.toBeNull()
      expect(symptoms).not.toBeNull()
      expect(dizziness).not.toBeNull()
      expect(weight).not.toBeNull()
      expect(texts).not.toHaveLength(0)

      if (
        recommendations === null ||
        symptoms === null ||
        dizziness === null ||
        weight === null ||
        texts.length === 0
      )
        fail('Invalid key point message')

      const message: HealthSummaryKeyPointMessage = {
        recommendationsCategory: recommendations,
        symptomScoreCategory: symptoms,
        dizzinessCategory: dizziness,
        weightCategory: weight,
        texts,
      }

      keyPointMessages.push(message)
    })

    expect(keyPointMessages).toStrictEqual(healthSummaryKeyPointMessages.value)
  })

  it('should cover all combinations', () => {
    for (const recommendations of Object.values(
      HealthSummaryMedicationRecommendationsCategory,
    )) {
      for (const symptomScore of Object.values(
        HealthSummarySymptomScoreCategory,
      )) {
        for (const dizziness of Object.values(HealthSummaryDizzinessCategory)) {
          if (
            (symptomScore === HealthSummarySymptomScoreCategory.INADEQUATE) !==
            (dizziness === HealthSummaryDizzinessCategory.INADEQUATE)
          ) {
            continue
          }
          for (const weight of Object.values(HealthSummaryWeightCategory)) {
            const texts = healthSummaryKeyPointTexts({
              recommendations,
              symptomScore,
              dizziness,
              weight,
            })
            expect(texts ?? []).not.toHaveLength(0)
          }
        }
      }
    }
  })
})

function separateKeyPointTexts(string: string): string[] {
  return string
    .split('\n')
    .map((line) =>
      (line.match(/[0-9]\.\) .*/g) ? line.substring(4) : line)
        .replace(/\s+/g, ' ')
        .trim(),
    )
}
