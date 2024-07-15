import { describe, it } from 'mocha'
import { RasiRecommender } from './rasiRecommender.js'
import { MockContraindicationService } from '../../../tests/mocks/contraindicationService.js'
import { mockHealthSummaryData } from '../../../tests/mocks/healthSummaryData.js'
import { FhirService } from '../../fhir/fhirService.js'
import { type RecommendationInput } from '../recommendationService.js'

describe('RasiRecommender', () => {
  const contraindicationService = new MockContraindicationService(
    [],
    [],
    [],
    [],
    [],
    [],
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
