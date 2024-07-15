//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type MedicationOptimization } from './medication.js'
import { type Vitals } from './vitals.js'
import { type KccqScore } from '../models/kccqScore.js'

export interface HealthSummaryData {
  name: string
  dateOfBirth?: Date
  clinicianName: string
  nextAppointment?: Date
  medications: MedicationOptimization[]
  vitals: Vitals
  symptomScores: KccqScore[]
}
