//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { Recommender } from './recommender.js'
import {
  MedicationRecommendationCategory,
  type MedicationRecommendation,
} from '../../../models/medicationRecommendation.js'
import { MedicationClassReference } from '../../codes.js'
import { type RecommendationInput } from '../recommendationService.js'

export class DiureticRecommender extends Recommender {
  // Methods

  compute(input: RecommendationInput): MedicationRecommendation[] {
    const currentMedication = this.findCurrentMedication(input.requests, [
      MedicationClassReference.diuretics,
    ])
    if (!currentMedication) return []
    return this.createRecommendation(
      currentMedication,
      undefined,
      MedicationRecommendationCategory.noActionRequired,
    )
  }
}
