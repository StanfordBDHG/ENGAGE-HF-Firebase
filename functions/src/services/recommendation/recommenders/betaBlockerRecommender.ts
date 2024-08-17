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
import { UserMedicationRecommendationType } from '../../../models/types/userMedicationRecommendation.js'
import { ContraindicationCategory } from '../../contraindication/contraindicationService.js'
import {
  MedicationClassReference,
  MedicationReference,
} from '../../references.js'

export class BetaBlockerRecommender extends Recommender {
  // Methods

  compute(input: RecommendationInput): RecommendationOutput[] {
    const currentRequests = this.findCurrentRequests(input.requests, [
      MedicationClassReference.betaBlockers,
    ])
    if (currentRequests.length === 0) return this.computeNew(input)

    if (this.isTargetDailyDoseReached(currentRequests))
      return this.createRecommendation(
        currentRequests,
        undefined,
        UserMedicationRecommendationType.targetDoseReached,
      )

    const medianSystolic = this.medianValue(
      this.observationsInLastTwoWeeks(input.vitals.systolicBloodPressure),
    )
    const medianHeartRate = this.medianValue(
      this.observationsInLastTwoWeeks(input.vitals.heartRate),
    )

    if (medianSystolic === undefined || medianHeartRate === undefined)
      return this.createRecommendation(
        currentRequests,
        undefined,
        UserMedicationRecommendationType.morePatientObservationsRequired,
      )

    if (medianSystolic < 100 || medianHeartRate < 60)
      return this.createRecommendation(
        currentRequests,
        undefined,
        UserMedicationRecommendationType.personalTargetDoseReached,
      )

    if (
      input.latestSymptomScore !== undefined &&
      input.latestSymptomScore.dizzinessScore >= 3
    )
      return this.createRecommendation(
        currentRequests,
        undefined,
        UserMedicationRecommendationType.personalTargetDoseReached,
      )

    return this.createRecommendation(
      currentRequests,
      undefined,
      UserMedicationRecommendationType.improvementAvailable,
    )
  }

  // Helpers

  private computeNew(input: RecommendationInput): RecommendationOutput[] {
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
          UserMedicationRecommendationType.noActionRequired,
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

    if (medianSystolic === undefined || medianHeartRate === undefined)
      return this.createRecommendation(
        [],
        MedicationReference.carvedilol,
        UserMedicationRecommendationType.morePatientObservationsRequired,
      )

    if (medianSystolic < 100 || medianHeartRate < 60)
      return this.createRecommendation(
        [],
        MedicationReference.carvedilol,
        UserMedicationRecommendationType.noActionRequired,
      )

    return this.createRecommendation(
      [],
      MedicationReference.carvedilol,
      UserMedicationRecommendationType.notStarted,
    )
  }
}
