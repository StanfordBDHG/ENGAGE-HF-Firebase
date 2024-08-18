//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import fs from 'fs'
import { expect } from 'chai'
import { describe } from 'mocha'
import { DefaultSymptomScoreCalculator } from './defaultSymptomScoreCalculator.js'
import { FHIRQuestionnaireResponse } from '../../models/fhir/fhirQuestionnaireResponse.js'

describe('DefaultSymptomScoreCalculator', () => {
  it('correctly computes symptom scores as described in the resource file', () => {
    const calculator = new DefaultSymptomScoreCalculator()
    const fileContent = fs.readFileSync(
      'src/tests/resources/symptomScores.csv',
      'utf8',
    )
    const lines = fileContent.split('\n').slice(1)
    expect(lines.length).to.equal(2267)

    let lineIndex = -1
    for (const line of lines) {
      lineIndex++
      const values = line.split(',')
      expect(values.length).to.equal(18)

      const answer9 = (lineIndex % 6) - 1
      const response = FHIRQuestionnaireResponse.create({
        questionnaire:
          'http://spezi.health/fhir/questionnaire/9528ccc2-d1be-4c4c-9c3c-19f78e51ec19',
        questionnaireResponse: '60193B69-B0F7-4708-8CCE-F3CB2936628D',
        date: new Date('2024-07-18T18:46:37.219581961-07:00'),
        answer1a: parseInt(values[0]),
        answer1b: parseInt(values[1]),
        answer1c: parseInt(values[2]),
        answer2: parseInt(values[3]),
        answer3: parseInt(values[4]),
        answer4: parseInt(values[5]),
        answer5: parseInt(values[6]),
        answer6: parseInt(values[7]),
        answer7: parseInt(values[8]),
        answer8a: parseInt(values[9]),
        answer8b: parseInt(values[10]),
        answer8c: parseInt(values[11]),
        answer9: answer9,
      })

      const score = calculator.calculate(response)
      expect(score.questionnaireResponseId).to.equal(response.id)
      expect(score.date).to.equal(response.authored)

      if (score.physicalLimitsScore !== undefined) {
        expect(
          score.physicalLimitsScore,
          `${lineIndex} - Physical Limits: ${line}`,
        ).to.approximately(parseFloat(values[12]), 0.16667)
      } else {
        expect(values[12]).to.equal('')
      }

      if (score.symptomFrequencyScore !== undefined) {
        expect(
          Math.round(score.symptomFrequencyScore),
          `${lineIndex} - Symptom Frequency: ${line}`,
        ).to.approximately(parseFloat(values[13]), 1)
      } else {
        expect(values[13]).to.equal('')
      }

      if (score.qualityOfLifeScore !== undefined) {
        expect(
          score.qualityOfLifeScore,
          `${lineIndex} - Quality of Life: ${line}`,
        ).to.approximately(parseFloat(values[14]), 0.00001)
      } else {
        expect(values[14]).to.equal('')
      }

      if (score.socialLimitsScore !== undefined) {
        expect(
          score.socialLimitsScore,
          `${lineIndex} - Social Limits: ${line}`,
        ).to.approximately(parseFloat(values[15]), 0.166667)
      } else {
        expect(values[15]).to.equal('')
      }

      if (
        score.physicalLimitsScore !== undefined &&
        score.symptomFrequencyScore !== undefined
      ) {
        expect(
          (score.physicalLimitsScore + score.symptomFrequencyScore) / 2,
          `${lineIndex} - Clinical Summary: ${line}`,
        ).to.approximately(parseFloat(values[16]), 0.55)
      }

      expect(
        score.overallScore,
        `${lineIndex} - Overall score: ${line} ${JSON.stringify(score)}`,
      ).to.approximately(parseFloat(values[17]), 0.4)

      expect(score.dizzinessScore, `Dizziness: ${line}`).to.equal(answer9)
    }
  })
})
