//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

export interface SymptomScore {
  questionnaireResponseId: string | null
  date: Date
  overallScore: number
  physicalLimitsScore: number | null
  symptomFrequencyScore: number | null
  socialLimitsScore: number | null
  qualityOfLifeScore: number | null
  dizzinessScore: number
}
