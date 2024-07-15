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

export class Sglt2iRecommender extends Recommender {
  // Methods

  compute(input: RecommendationInput): MedicationRecommendation[] {
    const currentMedication = this.findCurrentMedication(input.requests, [
      MedicationClassReference.sglt2inhibitors,
    ])
    if (!currentMedication) return this.computeNew(input)

    if (this.isTargetDoseReached(currentMedication))
      return this.createRecommendation(
        currentMedication,
        undefined,
        MedicationRecommendationCategory.targetDoseReached,
      )

    if (input.vitals.systolicBloodPressure.length < 3)
      return this.createRecommendation(
        currentMedication,
        undefined,
        MedicationRecommendationCategory.morePatientObservationsRequired,
      )

    const medianSystolic = input.vitals.systolicBloodPressure.at(
      input.vitals.systolicBloodPressure.length / 2,
    )?.value
    if (medianSystolic && medianSystolic < 100)
      return this.createRecommendation(
        currentMedication,
        undefined,
        MedicationRecommendationCategory.personalTargetDoseReached,
      )

    return this.createRecommendation(
      currentMedication,
      undefined,
      MedicationRecommendationCategory.improvementAvailable,
    )
  }

  // Helpers

  private computeNew(input: RecommendationInput): MedicationRecommendation[] {
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
          undefined,
          MedicationReference.empagliflozin,
          MedicationRecommendationCategory.noActionRequired,
        )
      case ContraindicationCategory.none:
        break
    }

    if (input.vitals.systolicBloodPressure.length < 3)
      return this.createRecommendation(
        undefined,
        MedicationReference.empagliflozin,
        MedicationRecommendationCategory.morePatientObservationsRequired,
      )

    const medianSystolic = input.vitals.systolicBloodPressure.at(
      input.vitals.systolicBloodPressure.length / 2,
    )?.value

    if (medianSystolic && medianSystolic < 100)
      return this.createRecommendation(
        undefined,
        MedicationReference.empagliflozin,
        MedicationRecommendationCategory.noActionRequired,
      )

    return this.createRecommendation(
      undefined,
      MedicationReference.empagliflozin,
      MedicationRecommendationCategory.notStarted,
    )
  }
}
