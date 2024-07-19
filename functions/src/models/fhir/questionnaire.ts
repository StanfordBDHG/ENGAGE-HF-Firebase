//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

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
