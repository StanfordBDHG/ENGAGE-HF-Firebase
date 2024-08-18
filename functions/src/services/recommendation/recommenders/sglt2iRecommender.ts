//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { Recommender } from './recommender.js'
import { UserMedicationRecommendationType } from '../../../models/types/userMedicationRecommendation.js'
import { ContraindicationCategory } from '../../contraindication/contraindicationService.js'
import {
  MedicationClassReference,
  MedicationReference,
} from '../../references.js'
import {
  type RecommendationInput,
  type RecommendationOutput,
} from '../recommendationService.js'

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
        UserMedicationRecommendationType.targetDoseReached,
      )

    const medianSystolic = this.medianValue(input.vitals.systolicBloodPressure)

    if (medianSystolic === undefined)
      return this.createRecommendation(
        currentRequests,
        undefined,
        UserMedicationRecommendationType.morePatientObservationsRequired,
      )

    if (medianSystolic < 100)
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
    const eGFR = input.vitals.estimatedGlomerularFiltrationRate?.value
    if (eGFR !== undefined && eGFR < 20) return []

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
          UserMedicationRecommendationType.noActionRequired,
        )
      case ContraindicationCategory.none:
        break
    }

    const medianSystolic = this.medianValue(input.vitals.systolicBloodPressure)

    if (medianSystolic === undefined)
      return this.createRecommendation(
        [],
        MedicationReference.empagliflozin,
        UserMedicationRecommendationType.morePatientObservationsRequired,
      )

    if (medianSystolic < 100)
      return this.createRecommendation(
        [],
        MedicationReference.empagliflozin,
        UserMedicationRecommendationType.noActionRequired,
      )

    return this.createRecommendation(
      [],
      MedicationReference.empagliflozin,
      UserMedicationRecommendationType.notStarted,
    )
  }
}
