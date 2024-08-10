//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type MedicationRecommendation } from './medicationRecommendation.js'
import { type SymptomScore } from './symptomScore.js'
import { type Vitals } from './vitals.js'

export interface HealthSummaryData {
  name: string
  dateOfBirth?: string
  clinicianName: string
  nextAppointment?: string
  recommendations: MedicationRecommendation[]
  vitals: Vitals
  symptomScores: SymptomScore[]
}
