//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type FHIRResource, type FHIRCoding } from './baseTypes.js'

export interface FHIRQuestionnaireResponse extends FHIRResource {
  authored: Date
  id?: string
  item?: FHIRQuestionnaireResponseItem[]
  questionnaire: string
}

export interface FHIRQuestionnaireResponseItem {
  answer?: FHIRQuestionnaireResponseItemAnswer[]
  linkId?: string
}

export interface FHIRQuestionnaireResponseItemAnswer {
  valueCoding?: FHIRCoding
}
