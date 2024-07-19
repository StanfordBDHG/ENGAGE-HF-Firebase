import { type FHIRCoding } from './baseTypes'

export interface FHIRQuestionnaireResponse {
  authored: Date
  id?: string
  item?: FHIRQuestionnaireResponseItem[]
  questionnaire?: string
}

export interface FHIRQuestionnaireResponseItem {
  answer?: FHIRQuestionnaireResponseItemAnswer[]
  linkId?: string
}

export interface FHIRQuestionnaireResponseItemAnswer {
  valueCoding?: FHIRCoding
}
