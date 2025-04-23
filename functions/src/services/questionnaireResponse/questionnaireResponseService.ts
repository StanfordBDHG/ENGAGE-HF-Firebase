//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type FHIRQuestionnaireResponse,
  type Observation,
  type SymptomScore,
} from '@stanfordbdhg/engagehf-models'

export interface QuestionnaireResponse {
  symptomScore: SymptomScore
  creatinine: Observation | null
  estimatedGlomerularFiltrationRate: Observation | null
  potassium: Observation | null
}

export interface QuestionnaireResponseService {
  extract(response: FHIRQuestionnaireResponse): Promise<QuestionnaireResponse>
}
