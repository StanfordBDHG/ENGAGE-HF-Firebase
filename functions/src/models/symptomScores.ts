//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

export interface SymptomScores {
  questionnaireResponseId?: string
  date: Date
  overallScore: number
  physicalLimitsScore: number
  socialLimitsScore: number
  qualityOfLifeScore: number
  specificSymptomsScore: number
  dizzinessScore: number
}
