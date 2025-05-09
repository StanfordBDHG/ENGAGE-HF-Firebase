//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { FHIRQuestionnaireResponse } from '@stanfordbdhg/engagehf-models'
import { SymptomScoreCalculator } from './symptomScoreCalculator.js'
import { readCsv } from '../../tests/helpers/csv.js'

describe('DefaultSymptomScoreCalculator', () => {
  it('correctly computes symptom scores', () => {
    const calculator = new SymptomScoreCalculator()
    readCsv('src/tests/resources/symptomScores.csv', 2268, (values, index) => {
      if (index === 0) return
      expect(values).toHaveLength(18)

      const q1: Record<string, number> = {
        'Not at all limited': 5,
        'Slightly limited': 4,
        'Moderately limited': 3,
        'Quite a bit limited': 2,
        'Extremely limited': 1,
        'Limited for other reasons or do not do the activity': 6,
        '': 6,
      }
      const answer1a = q1[values[6]]
      expect(answer1a).toBeDefined()
      const answer1b = q1[values[7]]
      expect(answer1b).toBeDefined()
      const answer1c = q1[values[8]]
      expect(answer1c).toBeDefined()

      const q2: Record<string, number> = {
        'Never over the past 2 weeks': 5,
        'Less than once a week': 4,
        '1-2 times a week': 3,
        '3 or more times a week, but not every day': 2,
        'Every morning': 1,
      }
      const answer2 = q2[values[9]]
      expect(answer2).toBeDefined()

      const q3: Record<string, number> = {
        'Never over the past 2 weeks': 7,
        'Less than once a week': 6,
        '1-2 times a week': 5,
        '3 or more times as week but not every day': 4,
        'At least once a day': 3,
        'Several times a day': 2,
        'All of the time': 1,
      }
      const answer3 = q3[values[10]]
      expect(answer3).toBeDefined()

      const q4: Record<string, number> = {
        'Never over the past 2 weeks': 7,
        'Less than once a week': 6,
        '1-2 times a week': 5,
        '3 or more times a week but not every day': 4,
        'At least once a day': 3,
        'Several times a day': 2,
        'All of the time': 1,
      }
      const answer4 = q4[values[11]]
      expect(answer4).toBeDefined()

      const q5: Record<string, number> = {
        'Never over the past 2 weeks': 5,
        'Less than once a week': 4,
        '1-2 times a week': 3,
        '3 or more times a week, but not every night': 2,
        'Every night': 1,
      }
      const answer5 = q5[values[12]]
      expect(answer5).toBeDefined()

      const q6: Record<string, number> = {
        'It has <b>extremely</b> limited my enjoyment of life': 1,
        'It has <b>slightly</b> limited my enjoyment of life': 4,
        'It has <b>not limited</b> my enjoyment of life at all': 5,
        'It has <b>moderately</b> limited my enjoyment of life': 3,
        'It has  limited my enjoyment of life <b>quite a bit</b>': 2,
      }
      const answer6 = q6[values[13]]
      expect(answer6).toBeDefined()

      const q7: Record<string, number> = {
        'Not at all satisfied': 1,
        'Mostly satisfied': 4,
        'Completely satisfied': 5,
        'Mostly dissatisfied': 2,
        'Somewhat satisfied': 3,
      }
      const answer7 = q7[values[14]]
      expect(answer7).toBeDefined()

      const q8: Record<string, number> = {
        'Extremely limited': 1,
        'Moderately limited': 3,
        'Does not apply or did not do for other reasons': 6,
        'Not at all limited': 5,
        'Slightly limited': 4,
        'Quite a bit limited': 2,
      }
      const answer8a = q8[values[15]]
      expect(answer8a).toBeDefined()
      const answer8b = q8[values[16]]
      expect(answer8b).toBeDefined()
      const answer8c = q8[values[17]]
      expect(answer8c).toBeDefined()

      const input = {
        answer1a,
        answer1b,
        answer1c,
        answer2,
        answer3,
        answer4,
        answer5,
        answer6,
        answer7,
        answer8a,
        answer8b,
        answer8c,
        answer9: (index % 6) - 1,
      }

      const score = calculator.calculate(input)

      // In this test, we use approximations to compare the expected and actual values.
      // This is to avoid floating point precision issues. Therefore, we use a tolerance of 0.001,
      // which is a reasonable tolerance, since the values are shown to the user as integers anyways.

      if (score.physicalLimitsScore !== undefined) {
        expect(score.physicalLimitsScore).toBeCloseTo(parseFloat(values[1]), 4)
      } else {
        expect(values[1]).toBe('')
      }

      if (score.symptomFrequencyScore !== undefined) {
        expect(score.symptomFrequencyScore).toBeCloseTo(
          parseFloat(values[2]),
          4,
        )
      } else {
        expect(values[2]).toBe('')
      }

      if (score.qualityOfLifeScore !== undefined) {
        expect(score.qualityOfLifeScore).toBeCloseTo(parseFloat(values[3]), 4)
      } else {
        expect(values[3]).toBe('')
      }

      if (score.socialLimitsScore !== undefined) {
        expect(score.socialLimitsScore).toBeCloseTo(parseFloat(values[4]), 4)
      } else {
        expect(values[4]).toBe('')
      }

      expect(score.overallScore).toBeCloseTo(parseFloat(values[5]), 4)

      expect(score.dizzinessScore).toBe((index % 6) - 1)
    })
  })
})
