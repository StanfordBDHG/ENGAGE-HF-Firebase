//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

export interface SymptomScore {
  questionnaireResponseId?: string
  date: Date
  overallScore: number
  physicalLimitsScore?: number
  symptomFrequencyScore?: number
  socialLimitsScore?: number
  qualityOfLifeScore?: number
  dizzinessScore: number
}
