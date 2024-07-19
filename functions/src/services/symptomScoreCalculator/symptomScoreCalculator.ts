import { type FHIRQuestionnaireResponse } from '../../models/fhir/questionnaireResponse.js'
import { type SymptomScore } from '../../models/symptomScore.js'

export interface SymptomScoreCalculator {
  calculate(response: FHIRQuestionnaireResponse): SymptomScore
}
