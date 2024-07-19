import { type FHIRCoding, type FHIRElement } from './baseTypes.js'

export interface FHIRQuestionnaire extends FHIRElement {
  title?: string
  language?: string
  publisher?: string
  url?: string
  item?: FHIRQuestionnaireItem[]
}

export interface FHIRQuestionnaireItem {
  linkId?: string
  type?: FHIRQuestionnaireItemType
  text?: string
  required?: boolean
  answerOption?: FHIRQuestionnaireItemAnswerOption[]
  item?: FHIRQuestionnaireItem[]
}

export enum FHIRQuestionnaireItemType {
  group = 'group',
  display = 'display',
  choice = 'choice',
}

export interface FHIRQuestionnaireItemAnswerOption {
  valueCoding?: FHIRCoding
}
