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
import { advanceDateByDays } from '../../../extensions/date.js'

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
        UserMedicationRecommendationType.targetDoseReached,
      )

    const lastMonth = advanceDateByDays(new Date(), -30)
    const creatinine = input.vitals.creatinine
    const potassium = input.vitals.potassium

    if (
      creatinine === undefined ||
      potassium === undefined ||
      creatinine.date < lastMonth ||
      potassium.date < lastMonth
    )
      return this.createRecommendation(
        currentRequests,
        undefined,
        UserMedicationRecommendationType.moreLabObservationsRequired,
      )

    if (creatinine.value > 2.5 || potassium.value > 5)
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
          UserMedicationRecommendationType.noActionRequired,
        )
      case ContraindicationCategory.none:
        break
    }

    const creatinine = input.vitals.creatinine?.value
    if (creatinine !== undefined && creatinine >= 2.5)
      return this.createRecommendation(
        [],
        MedicationReference.spironolactone,
        UserMedicationRecommendationType.noActionRequired,
      )

    const potassium = input.vitals.potassium?.value
    if (potassium !== undefined && potassium >= 5)
      return this.createRecommendation(
        [],
        MedicationReference.spironolactone,
        UserMedicationRecommendationType.noActionRequired,
      )

    return this.createRecommendation(
      [],
      MedicationReference.spironolactone,
      UserMedicationRecommendationType.notStarted,
    )
  }
}
