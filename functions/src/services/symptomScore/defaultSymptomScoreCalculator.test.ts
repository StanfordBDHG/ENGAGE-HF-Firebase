//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import { describe } from 'mocha'
import { DefaultSymptomScoreCalculator } from './defaultSymptomScoreCalculator.js'
import { mockQuestionnaireResponse } from '../../tests/mocks/questionnaireResponse.js'
import { FhirService } from '../fhir/fhirService.js'

describe('DefaultSymptomScoreCalculator', () => {
  it('should calculate symptom score', () => {
    const response = mockQuestionnaireResponse()
    const calculator = new DefaultSymptomScoreCalculator(new FhirService())
    const score = calculator.calculate(response)
    expect(score).to.deep.equal({
      questionnaireResponseId: response.id,
      date: new Date(response.authored),
      overallScore: 54,
      socialLimitsScore: 58,
      physicalLimitsScore: 42,
      qualityOfLifeScore: 63,
      symptomFrequencyScore: 52,
      dizzinessScore: 3,
    })
  })
})
