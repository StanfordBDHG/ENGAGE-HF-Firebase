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
import { MedicationClassReference, MedicationReference } from '../../codes.js'
import { ContraindicationCategory } from '../../contraindication/contraindicationService.js'
import { type RecommendationInput } from '../recommendationService.js'

export class BetaBlockerRecommender extends Recommender {
  // Methods

  compute(input: RecommendationInput): MedicationRecommendation[] {
    const currentRequests = this.findCurrentRequests(input.requests, [
      MedicationClassReference.betaBlockers,
    ])
    if (currentRequests.length === 0) return this.computeNew(input)

    if (this.isTargetDailyDoseReached(currentRequests))
      return this.createRecommendation(
        currentRequests,
        undefined,
        MedicationRecommendationCategory.targetDoseReached,
      )

    const medianSystolic = this.medianValue(
      this.observationsInLastTwoWeeks(input.vitals.systolicBloodPressure),
    )
    const medianHeartRate = this.medianValue(
      this.observationsInLastTwoWeeks(input.vitals.heartRate),
    )

    if (!medianSystolic || !medianHeartRate)
      return this.createRecommendation(
        currentRequests,
        undefined,
        MedicationRecommendationCategory.morePatientObservationsRequired,
      )

    if (medianSystolic < 100 || medianHeartRate < 60)
      return this.createRecommendation(
        currentRequests,
        undefined,
        MedicationRecommendationCategory.personalTargetDoseReached,
      )

    if (
      input.symptomScores?.dizzinessScore &&
      input.symptomScores.dizzinessScore >= 3
    )
      return this.createRecommendation(
        currentRequests,
        undefined,
        MedicationRecommendationCategory.personalTargetDoseReached,
      )

    return this.createRecommendation(
      currentRequests,
      undefined,
      MedicationRecommendationCategory.improvementAvailable,
    )
  }

  // Helpers

  private computeNew(input: RecommendationInput): MedicationRecommendation[] {
    const contraindicationCategory =
      this.contraindicationService.checkMedicationClass(
        input.contraindications,
        MedicationClassReference.betaBlockers,
      )

    switch (contraindicationCategory) {
      case ContraindicationCategory.severeAllergyIntolerance:
      case ContraindicationCategory.allergyIntolerance:
        return []
      case ContraindicationCategory.clinicianListed:
        return this.createRecommendation(
          [],
          MedicationReference.carvedilol,
          MedicationRecommendationCategory.noActionRequired,
        )
      case ContraindicationCategory.none:
        break
    }

    const medianSystolic = this.medianValue(
      this.observationsInLastTwoWeeks(input.vitals.systolicBloodPressure),
    )
    const medianHeartRate = this.medianValue(
      this.observationsInLastTwoWeeks(input.vitals.heartRate),
    )

    if (!medianSystolic || !medianHeartRate)
      return this.createRecommendation(
        [],
        MedicationReference.carvedilol,
        MedicationRecommendationCategory.morePatientObservationsRequired,
      )

    if (medianSystolic < 100 || medianHeartRate < 60)
      return this.createRecommendation(
        [],
        MedicationReference.carvedilol,
        MedicationRecommendationCategory.noActionRequired,
      )

    return this.createRecommendation(
      [],
      MedicationReference.carvedilol,
      MedicationRecommendationCategory.notStarted,
    )
  }
}
