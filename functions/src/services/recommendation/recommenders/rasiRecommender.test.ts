//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { describe, it } from 'mocha'
import { RasiRecommender } from './rasiRecommender.js'
import { MockContraindicationService } from '../../../tests/mocks/contraindicationService.js'
import { mockHealthSummaryData } from '../../../tests/mocks/healthSummaryData.js'
import { ContraindicationCategory } from '../../contraindication/contraindicationService.js'
import { FhirService } from '../../fhir/fhirService.js'
import { type RecommendationInput } from '../recommendationService.js'

describe('RasiRecommender', () => {
  const contraindicationCategory = ContraindicationCategory.none
  const contraindicationService = new MockContraindicationService(
    (_, __) => contraindicationCategory,
    (_, __) => contraindicationCategory,
  )
  const fhirService = new FhirService()
  const recommender = new RasiRecommender(contraindicationService, fhirService)

  it('should return the right value', () => {
    const healthSummaryData = mockHealthSummaryData()
    const input: RecommendationInput = {
      requests: [],
      contraindications: [],
      symptomScores: healthSummaryData.symptomScores.at(-1),
      vitals: healthSummaryData.vitals,
    }
    const result = recommender.compute(input)
    console.log(JSON.stringify(result))
  })
})
