//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { Recommender } from './recommender.js'
import { median } from '../../../extensions/array.js'
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
    const currentMedication = this.findCurrentMedication(input.requests, [
      MedicationClassReference.betaBlockers,
    ])
    if (!currentMedication) return this.computeNew(input)

    if (this.isTargetDoseReached(currentMedication))
      return this.createRecommendation(
        currentMedication,
        undefined,
        MedicationRecommendationCategory.targetDoseReached,
      )

    return this.createRecommendation(
      currentMedication,
      undefined,
      MedicationRecommendationCategory.personalTargetDoseReached,
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
          undefined,
          MedicationReference.carvedilol,
          MedicationRecommendationCategory.noActionRequired,
        )
      case ContraindicationCategory.none:
        break
    }

    const medianSystolic = median(
      input.vitals.systolicBloodPressure.map(
        (observation) => observation.value,
      ),
    )
    const medianHeartRate = median(
      input.vitals.heartRate.map((observation) => observation.value),
    )
    if (
      !medianSystolic ||
      medianSystolic < 100 ||
      !medianHeartRate ||
      medianHeartRate < 60
    )
      return this.createRecommendation(
        undefined,
        MedicationReference.carvedilol,
        MedicationRecommendationCategory.noActionRequired,
      )

    return this.createRecommendation(
      undefined,
      MedicationReference.carvedilol,
      MedicationRecommendationCategory.notStarted,
    )
  }
}
