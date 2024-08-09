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

export class MraRecommender extends Recommender {
  // Methods

  compute(input: RecommendationInput): RecommendationOutput[] {
    const currentRequests = this.findCurrentRequests(input.requests, [
      MedicationClassReference.mineralocorticoidReceptorAntagonists,
    ])
    if (currentRequests.length === 0) return this.computeNew(input)

    if (this.isTargetDailyDoseReached(currentRequests))
      return this.createRecommendation(
        currentRequests,
        undefined,
        MedicationRecommendationType.targetDoseReached,
      )

    const durationOfOneDayInMilliseconds = 1000 * 60 * 60 * 24 * 7
    const lastMonth = new Date().getTime() - durationOfOneDayInMilliseconds * 30

    const creatinineObservation = input.vitals.creatinine
    const potassiumObservation = input.vitals.potassium

    if (
      !creatinineObservation ||
      !potassiumObservation ||
      creatinineObservation.date.getTime() < lastMonth ||
      potassiumObservation.date.getTime() < lastMonth
    )
      return this.createRecommendation(
        currentRequests,
        undefined,
        MedicationRecommendationType.moreLabObservationsRequired,
      )

    if (creatinineObservation.value > 2.5 || potassiumObservation.value > 5)
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
    const contraindication = this.contraindicationService.checkMedicationClass(
      input.contraindications,
      MedicationClassReference.mineralocorticoidReceptorAntagonists,
    )
    switch (contraindication) {
      case ContraindicationCategory.severeAllergyIntolerance:
      case ContraindicationCategory.allergyIntolerance:
        return []
      case ContraindicationCategory.clinicianListed:
        return this.createRecommendation(
          [],
          MedicationReference.spironolactone,
          MedicationRecommendationType.noActionRequired,
        )
      case ContraindicationCategory.none:
        break
    }

    const creatinine = input.vitals.creatinine?.value
    if (creatinine && creatinine >= 2.5)
      return this.createRecommendation(
        [],
        MedicationReference.spironolactone,
        MedicationRecommendationType.noActionRequired,
      )

    const potassium = input.vitals.potassium?.value
    if (potassium && potassium >= 5)
      return this.createRecommendation(
        [],
        MedicationReference.spironolactone,
        MedicationRecommendationType.noActionRequired,
      )

    return this.createRecommendation(
      [],
      MedicationReference.spironolactone,
      MedicationRecommendationType.notStarted,
    )
  }
}
