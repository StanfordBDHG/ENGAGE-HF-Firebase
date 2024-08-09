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
import { MedicationClassReference, MedicationReference } from '../../codes.js'
import { ContraindicationCategory } from '../../contraindication/contraindicationService.js'

export class Sglt2iRecommender extends Recommender {
  // Methods

  compute(input: RecommendationInput): RecommendationOutput[] {
    const currentRequests = this.findCurrentRequests(input.requests, [
      MedicationClassReference.sglt2inhibitors,
    ])
    if (currentRequests.length === 0) return this.computeNew(input)

    if (this.isTargetDailyDoseReached(currentRequests))
      return this.createRecommendation(
        currentRequests,
        undefined,
        MedicationRecommendationType.targetDoseReached,
      )

    const medianSystolic = this.medianValue(
      this.observationsInLastTwoWeeks(input.vitals.systolicBloodPressure),
    )

    if (!medianSystolic)
      return this.createRecommendation(
        currentRequests,
        undefined,
        MedicationRecommendationType.morePatientObservationsRequired,
      )

    if (medianSystolic < 100)
      return this.createRecommendation(
        currentRequests,
        undefined,
        MedicationRecommendationType.personalTargetDoseReached,
      )

    return this.createRecommendation(
      currentRequests,
      undefined,
      MedicationRecommendationType.improvementAvailable,
    )
  }

  // Helpers

  private computeNew(input: RecommendationInput): RecommendationOutput[] {
    const eGFR = input.vitals.estimatedGlomerularFiltrationRate?.value
    if (eGFR && eGFR >= 20) return []

    const contraindicationCategory =
      this.contraindicationService.checkMedicationClass(
        input.contraindications,
        MedicationClassReference.sglt2inhibitors,
      )

    switch (contraindicationCategory) {
      case ContraindicationCategory.severeAllergyIntolerance:
      case ContraindicationCategory.allergyIntolerance:
        return []
      case ContraindicationCategory.clinicianListed:
        return this.createRecommendation(
          [],
          MedicationReference.empagliflozin,
          MedicationRecommendationType.noActionRequired,
        )
      case ContraindicationCategory.none:
        break
    }

    const medianSystolic = this.medianValue(
      this.observationsInLastTwoWeeks(input.vitals.systolicBloodPressure),
    )

    if (!medianSystolic)
      return this.createRecommendation(
        [],
        MedicationReference.empagliflozin,
        MedicationRecommendationType.morePatientObservationsRequired,
      )

    if (medianSystolic < 100)
      return this.createRecommendation(
        [],
        MedicationReference.empagliflozin,
        MedicationRecommendationType.noActionRequired,
      )

    return this.createRecommendation(
      [],
      MedicationReference.empagliflozin,
      MedicationRecommendationType.notStarted,
    )
  }
}
