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
import { type MedicationRequestContext } from '../../../models/medicationRequestContext.js'
import { MedicationClassReference, MedicationReference } from '../../codes.js'
import { ContraindicationCategory } from '../../contraindication/contraindicationService.js'

export class RasiRecommender extends Recommender {
  // Methods

  compute(input: RecommendationInput): RecommendationOutput[] {
    const arni = this.findCurrentRequests(input.requests, [
      MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
    ])
    if (arni.length > 0) return this.computeArni(arni, input)

    const aceiAndArb = this.findCurrentRequests(input.requests, [
      MedicationClassReference.angiotensinConvertingEnzymeInhibitors,
      MedicationClassReference.angiotensinReceptorBlockers,
    ])
    if (aceiAndArb.length > 0) return this.computeAceiAndArb(aceiAndArb, input)

    return this.computeNew(input)
  }

  // Helpers

  private computeAceiAndArb(
    requests: MedicationRequestContext[],
    input: RecommendationInput,
  ): RecommendationOutput[] {
    const contraindicationToArni =
      this.contraindicationService.checkMedicationClass(
        input.contraindications,
        MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
      )

    switch (contraindicationToArni) {
      case ContraindicationCategory.severeAllergyIntolerance:
      case ContraindicationCategory.allergyIntolerance:
      case ContraindicationCategory.clinicianListed:
        if (this.isTargetDailyDoseReached(requests))
          return this.createRecommendation(
            requests,
            undefined,
            MedicationRecommendationType.targetDoseReached,
          )

        const systolicValuesInLastTwoWeeks = this.observationsInLastTwoWeeks(
          input.vitals.systolicBloodPressure,
        )
        const medianSystolic = this.medianValue(systolicValuesInLastTwoWeeks)
        if (!medianSystolic)
          return this.createRecommendation(
            requests,
            undefined,
            MedicationRecommendationType.morePatientObservationsRequired,
          )

        const lowSystolicCount = systolicValuesInLastTwoWeeks.filter(
          (observation) => observation.value < 85,
        ).length

        if (medianSystolic < 100 || lowSystolicCount >= 2)
          return this.createRecommendation(
            requests,
            undefined,
            MedicationRecommendationType.personalTargetDoseReached,
          )

        const creatinineObservation = input.vitals.creatinine
        const potassiumObservation = input.vitals.potassium
        if (
          creatinineObservation &&
          potassiumObservation &&
          (creatinineObservation.value >= 2.5 ||
            potassiumObservation.value >= 5)
        )
          return this.createRecommendation(
            requests,
            undefined,
            MedicationRecommendationType.personalTargetDoseReached,
          )

        if (
          input.latestSymptomScore &&
          input.latestSymptomScore.dizzinessScore >= 3
        )
          return this.createRecommendation(
            requests,
            undefined,
            MedicationRecommendationType.personalTargetDoseReached,
          )

        return this.createRecommendation(
          requests,
          undefined,
          MedicationRecommendationType.improvementAvailable,
        )
      case ContraindicationCategory.none:
        break
    }

    const systolicValuesInLastTwoWeeks = this.observationsInLastTwoWeeks(
      input.vitals.systolicBloodPressure,
    )
    const medianSystolic = this.medianValue(systolicValuesInLastTwoWeeks)

    if (!medianSystolic)
      return this.createRecommendation(
        requests,
        undefined,
        MedicationRecommendationType.morePatientObservationsRequired,
      )

    const lowCount = systolicValuesInLastTwoWeeks.filter(
      (observation) => observation.value < 85,
    ).length

    if (medianSystolic < 100 || lowCount >= 2)
      return this.createRecommendation(
        requests,
        undefined,
        MedicationRecommendationType.personalTargetDoseReached,
      )

    const creatinineObservation = input.vitals.creatinine
    const potassiumObservation = input.vitals.potassium
    if (
      creatinineObservation &&
      potassiumObservation &&
      (creatinineObservation.value >= 2.5 || potassiumObservation.value >= 5)
    )
      return this.createRecommendation(
        requests,
        undefined,
        MedicationRecommendationType.personalTargetDoseReached,
      )

    if (
      input.latestSymptomScore &&
      input.latestSymptomScore.dizzinessScore >= 3
    )
      return this.createRecommendation(
        requests,
        undefined,
        MedicationRecommendationType.personalTargetDoseReached,
      )

    return this.createRecommendation(
      requests,
      MedicationReference.sacubitrilValsartan,
      MedicationRecommendationType.improvementAvailable,
    )
  }

  private computeArni(
    requests: MedicationRequestContext[],
    input: RecommendationInput,
  ): RecommendationOutput[] {
    if (this.isTargetDailyDoseReached(requests))
      return this.createRecommendation(
        requests,
        undefined,
        MedicationRecommendationType.targetDoseReached,
      )

    const medianSystolic = this.medianValue(
      this.observationsInLastTwoWeeks(input.vitals.systolicBloodPressure),
    )

    if (!medianSystolic)
      return this.createRecommendation(
        requests,
        undefined,
        MedicationRecommendationType.morePatientObservationsRequired,
      )

    if (medianSystolic < 100)
      return this.createRecommendation(
        requests,
        undefined,
        MedicationRecommendationType.personalTargetDoseReached,
      )

    const creatinineObservation = input.vitals.creatinine
    const potassiumObservation = input.vitals.potassium
    if (
      creatinineObservation &&
      potassiumObservation &&
      (creatinineObservation.value >= 2.5 || potassiumObservation.value >= 5)
    )
      return this.createRecommendation(
        requests,
        undefined,
        MedicationRecommendationType.personalTargetDoseReached,
      )

    if (
      input.latestSymptomScore &&
      input.latestSymptomScore.dizzinessScore >= 3
    )
      return this.createRecommendation(
        requests,
        undefined,
        MedicationRecommendationType.personalTargetDoseReached,
      )

    return this.createRecommendation(
      requests,
      undefined,
      MedicationRecommendationType.improvementAvailable,
    )
  }

  private computeNew(input: RecommendationInput): RecommendationOutput[] {
    const contraindicationToArb =
      this.contraindicationService.checkMedicationClass(
        input.contraindications,
        MedicationClassReference.angiotensinReceptorBlockers,
      )
    switch (contraindicationToArb) {
      case ContraindicationCategory.severeAllergyIntolerance:
      case ContraindicationCategory.allergyIntolerance:
        return []
      case ContraindicationCategory.clinicianListed:
      case ContraindicationCategory.none:
        break
    }
    const contraindicationToAcei =
      this.contraindicationService.checkMedicationClass(
        input.contraindications,
        MedicationClassReference.angiotensinConvertingEnzymeInhibitors,
      )
    switch (contraindicationToAcei) {
      case ContraindicationCategory.severeAllergyIntolerance:
        return []
      case ContraindicationCategory.allergyIntolerance:
      case ContraindicationCategory.clinicianListed:
      case ContraindicationCategory.none:
        break
    }
    if (
      contraindicationToAcei !== ContraindicationCategory.none ||
      contraindicationToArb !== ContraindicationCategory.none
    )
      return this.createRecommendation(
        [],
        MedicationReference.losartan,
        MedicationRecommendationType.noActionRequired,
      )

    const systolicObservationsInLastTwoWeeks = this.observationsInLastTwoWeeks(
      input.vitals.systolicBloodPressure,
    )
    const medianSystolic = this.medianValue(systolicObservationsInLastTwoWeeks)

    if (!medianSystolic)
      return this.createRecommendation(
        [],
        MedicationReference.losartan,
        MedicationRecommendationType.morePatientObservationsRequired,
      )

    const lowCount = systolicObservationsInLastTwoWeeks.filter(
      (observation) => observation.value < 85,
    ).length

    if (medianSystolic < 100 || lowCount >= 2)
      return this.createRecommendation(
        [],
        MedicationReference.losartan,
        MedicationRecommendationType.noActionRequired,
      )

    const creatinineObservation = input.vitals.creatinine
    const potassiumObservation = input.vitals.potassium
    if (
      creatinineObservation &&
      potassiumObservation &&
      (creatinineObservation.value >= 2.5 || potassiumObservation.value >= 5)
    )
      return this.createRecommendation(
        [],
        MedicationReference.losartan,
        MedicationRecommendationType.noActionRequired,
      )

    const contraindicationToArni =
      this.contraindicationService.checkMedicationClass(
        input.contraindications,
        MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
      )

    switch (contraindicationToArni) {
      case ContraindicationCategory.severeAllergyIntolerance:
      case ContraindicationCategory.allergyIntolerance:
      case ContraindicationCategory.clinicianListed:
        return this.createRecommendation(
          [],
          MedicationReference.losartan,
          MedicationRecommendationType.notStarted,
        )
      case ContraindicationCategory.none:
        return this.createRecommendation(
          [],
          MedicationReference.sacubitrilValsartan,
          MedicationRecommendationType.notStarted,
        )
    }
  }
}
