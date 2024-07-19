import { type SymptomScoreCalculator } from './symptomScoreCalculator.js'
import { average } from '../../extensions/array.js'
import {
  type FHIRQuestionnaireResponse,
  type FHIRQuestionnaireResponseItemAnswer,
} from '../../models/fhir/questionnaireResponse.js'
import { type SymptomScore } from '../../models/symptomScore.js'

enum SymptomQuestionnaireLinkId {
  question1a = 'a459b804-35bf-4792-f1eb-0b52c4e176e1',
  question1b = 'cf9c5031-1ed5-438a-fc7d-dc69234015a0',
  question1c = '1fad0f81-b2a9-4c8f-9a78-4b2a5d7aef07',
  question2 = '692bda7d-a616-43d1-8dc6-8291f6460ab2',
  question3 = 'b1734b9e-1d16-4238-8556-5ae3fa0ba913',
  question4 = '57f37fb3-a0ad-4b1f-844e-3f67d9b76946',
  question5 = '396164df-d045-4c56-d710-513297bdc6f2',
  question6 = '75e3f62e-e37d-48a2-f4d9-af2db8922da0',
  question7 = 'fce3a16e-c6d8-4bac-8ab5-8f4aee4adc08',
  question8a = '8b022e69-127d-4447-8190-39ac645e60e1',
  question8b = '1eee7259-da1c-4cba-80a9-e67e684573a1',
  question8c = '883a22a8-2f6e-4b41-84b7-0028ed543192',
  question9 = '24108967-2ff3-40d0-c54f-a7b97bb84d05',
}

export class DefaultSymptomScoreCalculator implements SymptomScoreCalculator {
  // Methods

  calculate(response: FHIRQuestionnaireResponse): SymptomScore {
    const response9 = this.value(response, SymptomQuestionnaireLinkId.question9)
    const result: SymptomScore = {
      questionnaireResponseId: response.id,
      date: response.authored,
      overallScore: 0,
      socialLimitsScore: undefined,
      physicalLimitsScore: undefined,
      qualityOfLifeScore: undefined,
      symptomFrequencyScore: undefined,
      dizzinessScore: response9,
    }

    const q1NonMissing = [
      this.value(response, SymptomQuestionnaireLinkId.question1a),
      this.value(response, SymptomQuestionnaireLinkId.question1b),
      this.value(response, SymptomQuestionnaireLinkId.question1c),
    ].filter((x) => x !== 0)
    const q1Average = average(q1NonMissing)
    if (q1Average && q1NonMissing.length >= 2) {
      result.physicalLimitsScore = (100 * (q1Average - 1)) / 4
    }

    const response2 = this.value(response, SymptomQuestionnaireLinkId.question2)
    const response3 = this.value(response, SymptomQuestionnaireLinkId.question3)
    const response4 = this.value(response, SymptomQuestionnaireLinkId.question4)
    const response5 = this.value(response, SymptomQuestionnaireLinkId.question5)
    const symptomFrequencyAverage = average([
      (response2 - 1) / 4,
      (response3 - 1) / 6,
      (response4 - 1) / 6,
      (response5 - 1) / 4,
    ])
    if (symptomFrequencyAverage)
      result.symptomFrequencyScore = 100 * symptomFrequencyAverage

    const response6 = this.value(response, SymptomQuestionnaireLinkId.question6)
    const response7 = this.value(response, SymptomQuestionnaireLinkId.question7)
    const qualityOfLifeAverage = average([response6, response7])
    if (qualityOfLifeAverage)
      result.qualityOfLifeScore = (100 * (qualityOfLifeAverage - 1)) / 4

    const q8NonMissing = [
      this.value(response, SymptomQuestionnaireLinkId.question8a),
      this.value(response, SymptomQuestionnaireLinkId.question8b),
      this.value(response, SymptomQuestionnaireLinkId.question8c),
    ].filter((x) => x !== 0)
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

  // Helpers

  private value(
    response: FHIRQuestionnaireResponse,
    linkId: SymptomQuestionnaireLinkId,
  ): number {
    const string = this.extractSingleAnswer(response, linkId).valueCoding?.code
    if (!string) throw new Error(`No answer found for linkId ${linkId}`)
    return parseInt(string)
  }

  private extractSingleAnswer(
    response: FHIRQuestionnaireResponse,
    linkId: string,
  ): FHIRQuestionnaireResponseItemAnswer {
    const answers = this.extractAnswers(response, linkId)
    if (answers.length !== 1)
      throw new Error(`Not exactly one answer found for linkId ${linkId}`)
    return answers[0]
  }

  private extractAnswers(
    response: FHIRQuestionnaireResponse,
    linkId: string,
  ): FHIRQuestionnaireResponseItemAnswer[] {
    return response.item?.find((item) => item.linkId === linkId)?.answer ?? []
  }
}
