//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type FHIRQuestionnaireResponse } from '../../models/fhir/questionnaireResponse.js'
import { type SymptomScore } from '../../models/symptomScore.js'

export interface SymptomScoreCalculator {
  calculate(response: FHIRQuestionnaireResponse): SymptomScore
}
