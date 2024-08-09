//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type RecommendationInput,
  type RecommendationOutput,
  Recommender,
} from './recommender.js'
import { MedicationRecommendationType } from '../../../models/medicationRecommendation.js'
import { MedicationClassReference } from '../../codes.js'

export class DiureticRecommender extends Recommender {
  // Methods

  compute(input: RecommendationInput): RecommendationOutput[] {
    const currentRequests = this.findCurrentRequests(input.requests, [
      MedicationClassReference.diuretics,
    ])
    if (currentRequests.length === 0) return []
    return this.createRecommendation(
      currentRequests,
      undefined,
      MedicationRecommendationType.personalTargetDoseReached,
    )
  }
}
