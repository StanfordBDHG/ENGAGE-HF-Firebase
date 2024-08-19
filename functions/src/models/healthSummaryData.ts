//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type SymptomScore } from './types/symptomScore.js'
import { type UserMedicationRecommendation } from './types/userMedicationRecommendation.js'
import { type Vitals } from './vitals.js'

export interface HealthSummaryData {
  name?: string
  dateOfBirth?: Date
  clinicianName?: string
  nextAppointment?: Date
  recommendations: UserMedicationRecommendation[]
  vitals: Vitals
  symptomScores: SymptomScore[]
}
