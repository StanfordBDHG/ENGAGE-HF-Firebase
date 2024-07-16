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
import { type MedicationRequestContext } from '../../../models/medicationRequestContext.js'
import { MedicationClassReference, MedicationReference } from '../../codes.js'
import { ContraindicationCategory } from '../../contraindication/contraindicationService.js'
import { type RecommendationInput } from '../recommendationService.js'

export class RasiRecommender extends Recommender {
  // Methods

  compute(input: RecommendationInput): MedicationRecommendation[] {
    const arni = this.findCurrentMedication(input.requests, [
      MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
    ])
    if (arni) return this.computeArni(arni, input)

    const aceiAndArb = this.findCurrentMedication(input.requests, [
      MedicationClassReference.angiotensinConvertingEnzymeInhibitors,
      MedicationClassReference.angiotensinReceptorBlockers,
    ])
    if (aceiAndArb) return this.computeAceiAndArb(aceiAndArb, input)

    return this.computeNew(input)
  }

  // Helpers

  private computeAceiAndArb(
    request: MedicationRequestContext,
    input: RecommendationInput,
  ): MedicationRecommendation[] {
    const contraindicationToArni =
      this.contraindicationService.checkMedicationClass(
        input.contraindications,
        MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
      )

    switch (contraindicationToArni) {
      case ContraindicationCategory.severeAllergyIntolerance:
      case ContraindicationCategory.allergyIntolerance:
      case ContraindicationCategory.clinicianListed:
        if (this.isTargetDoseReached(request))
          return this.createRecommendation(
            request,
            undefined,
            MedicationRecommendationCategory.targetDoseReached,
          )

        if (input.vitals.systolicBloodPressure.length < 3)
          return this.createRecommendation(
            request,
            undefined,
            MedicationRecommendationCategory.morePatientObservationsRequired,
          )

        const medianSystolic = median(
          input.vitals.systolicBloodPressure.map(
            (observation) => observation.value,
          ),
        )
        const lowCount = input.vitals.systolicBloodPressure.filter(
          (x) => x.value < 85,
        ).length

        if (medianSystolic && medianSystolic < 100 && lowCount >= 2)
          return this.createRecommendation(
            request,
            undefined,
            MedicationRecommendationCategory.personalTargetDoseReached,
          )

        const creatinineObservation = input.vitals.creatinine
        const potassiumObservation = input.vitals.potassium
        if (
          creatinineObservation &&
          potassiumObservation &&
          creatinineObservation.value >= 2.5 &&
          potassiumObservation.value >= 5
        )
          return this.createRecommendation(
            request,
            undefined,
            MedicationRecommendationCategory.moreLabObservationsRequired,
          )

        if (input.symptomScores && input.symptomScores.dizzinessScore >= 3)
          return this.createRecommendation(
            request,
            undefined,
            MedicationRecommendationCategory.personalTargetDoseReached,
          )

        return this.createRecommendation(
          request,
          undefined,
          MedicationRecommendationCategory.improvementAvailable,
        )
      case ContraindicationCategory.none:
    }

    if (input.vitals.systolicBloodPressure.length < 3)
      return this.createRecommendation(
        request,
        undefined,
        MedicationRecommendationCategory.morePatientObservationsRequired,
      )

    const medianSystolic = median(
      input.vitals.systolicBloodPressure.map(
        (observation) => observation.value,
      ),
    )
    const lowCount = input.vitals.systolicBloodPressure.filter(
      (x) => x.value < 85,
    ).length

    if (medianSystolic && medianSystolic < 100 && lowCount >= 2)
      return this.createRecommendation(
        request,
        undefined,
        MedicationRecommendationCategory.personalTargetDoseReached,
      )

    const creatinineObservation = input.vitals.creatinine
    const potassiumObservation = input.vitals.potassium
    if (
      creatinineObservation &&
      potassiumObservation &&
      creatinineObservation.value >= 2.5 &&
      potassiumObservation.value >= 5
    )
      return this.createRecommendation(
        request,
        undefined,
        MedicationRecommendationCategory.moreLabObservationsRequired,
      )

    if (input.symptomScores && input.symptomScores.dizzinessScore >= 3)
      return this.createRecommendation(
        request,
        undefined,
        MedicationRecommendationCategory.personalTargetDoseReached,
      )

    return this.createRecommendation(
      request,
      MedicationReference.sacubitrilValsartan,
      MedicationRecommendationCategory.improvementAvailable,
    )
  }

  private computeArni(
    request: MedicationRequestContext,
    input: RecommendationInput,
  ): MedicationRecommendation[] {
    if (this.isTargetDoseReached(request))
      return this.createRecommendation(
        request,
        undefined,
        MedicationRecommendationCategory.targetDoseReached,
      )

    if (input.vitals.systolicBloodPressure.length < 3)
      return this.createRecommendation(
        request,
        undefined,
        MedicationRecommendationCategory.morePatientObservationsRequired,
      )

    const medianSystolic = median(
      input.vitals.systolicBloodPressure.map(
        (observation) => observation.value,
      ),
    )

    if (medianSystolic && medianSystolic < 100)
      return this.createRecommendation(
        request,
        undefined,
        MedicationRecommendationCategory.personalTargetDoseReached,
      )

    const creatinineObservation = input.vitals.creatinine
    const potassiumObservation = input.vitals.potassium
    if (!creatinineObservation || !potassiumObservation)
      return this.createRecommendation(
        request,
        undefined,
        MedicationRecommendationCategory.moreLabObservationsRequired,
      )

    if (creatinineObservation.value >= 2.5 || potassiumObservation.value >= 5)
      return this.createRecommendation(
        request,
        undefined,
        MedicationRecommendationCategory.personalTargetDoseReached,
      )

    if (input.symptomScores && input.symptomScores.dizzinessScore >= 3)
      return this.createRecommendation(
        request,
        undefined,
        MedicationRecommendationCategory.personalTargetDoseReached,
      )

    return this.createRecommendation(
      request,
      undefined,
      MedicationRecommendationCategory.improvementAvailable,
    )
  }

  private computeNew(input: RecommendationInput): MedicationRecommendation[] {
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
        undefined,
        MedicationReference.losartan,
        MedicationRecommendationCategory.noActionRequired,
      )

    if (input.vitals.systolicBloodPressure.length < 3)
      return this.createRecommendation(
        undefined,
        MedicationReference.losartan,
        MedicationRecommendationCategory.morePatientObservationsRequired,
      )

    const medianSystolic = median(
      input.vitals.systolicBloodPressure.map(
        (observation) => observation.value,
      ),
    )

    const lowCount = input.vitals.systolicBloodPressure.filter(
      (x) => x.value < 85,
    ).length

    if (medianSystolic && medianSystolic < 100 && lowCount >= 2)
      return this.createRecommendation(
        undefined,
        MedicationReference.losartan,
        MedicationRecommendationCategory.noActionRequired,
      )

    const creatinineObservation = input.vitals.creatinine
    const potassiumObservation = input.vitals.potassium
    if (
      creatinineObservation &&
      potassiumObservation &&
      (creatinineObservation.value >= 2.5 || potassiumObservation.value >= 5)
    )
      return this.createRecommendation(
        undefined,
        MedicationReference.losartan,
        MedicationRecommendationCategory.moreLabObservationsRequired,
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
          undefined,
          MedicationReference.losartan,
          MedicationRecommendationCategory.notStarted,
        )
      case ContraindicationCategory.none:
        return this.createRecommendation(
          undefined,
          MedicationReference.sacubitrilValsartan,
          MedicationRecommendationCategory.notStarted,
        )
    }
  }
}
