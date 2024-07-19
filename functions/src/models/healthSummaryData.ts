//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type MedicationRecommendationCategory } from './medicationRecommendation.js'
import { type SymptomScore } from './symptomScore.js'
import { type Vitals } from './vitals.js'

export interface HealthSummaryData {
  name: string
  dateOfBirth?: Date
  clinicianName: string
  nextAppointment?: Date
  medications: MedicationOptimization[]
  vitals: Vitals
  symptomScores: SymptomScore[]
}

export interface MedicationOptimization {
  name: string
  dose: string
  targetDose: string
  potentialPositiveChange: string
  category: MedicationRecommendationCategory
}
