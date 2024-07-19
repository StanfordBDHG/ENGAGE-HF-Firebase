import { expect } from 'chai'
import { describe } from 'mocha'
import { DefaultSymptomScoreCalculator } from './defaultSymptomScoreCalculator.js'
import { mockQuestionnaireResponse } from '../../tests/mocks/questionnaireResponse.js'

describe('DefaultSymptomScoreCalculator', () => {
  it('should calculate symptom score', () => {
    const response = mockQuestionnaireResponse()
    const calculator = new DefaultSymptomScoreCalculator()
    const score = calculator.calculate(response)
    expect(score).to.deep.equal({
      questionnaireResponseId: response.id,
      date: response.authored,
      overallScore: 54,
      socialLimitsScore: 58,
      physicalLimitsScore: 42,
      qualityOfLifeScore: 63,
      symptomFrequencyScore: 52,
      dizzinessScore: 3,
    })
  })
})
