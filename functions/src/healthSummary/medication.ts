//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type MedicationRecommendationCategory } from '../models/medicationRecommendation'

export interface MedicationOptimization {
  name: string
  dose: string
  targetDose: string
  potentialPositiveChange: string
  category: MedicationRecommendationCategory
}
