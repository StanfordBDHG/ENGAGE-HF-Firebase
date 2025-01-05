//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  average,
  compactMap,
  QuantityUnit,
  UserMedicationRecommendationType,
  type FHIRAppointment,
  type Observation,
  type SymptomScore,
  type UserMedicationRecommendation,
} from '@stanfordbdhg/engagehf-models'

export interface HealthSummaryVitals {
  systolicBloodPressure: Observation[]
  diastolicBloodPressure: Observation[]
  heartRate: Observation[]
  bodyWeight: Observation[]

  dryWeight?: Observation
}

export enum HealthSummarySymptomScoreCategory {
  ABOVE_90_STABLE_OR_IMPROVING,
  ABOVE_90_WORSENING,
  BELOW_90_STABLE_OR_IMPROVING,
  BELOW_90_WORSENING,
}

export enum HealthSummaryMedicationRecommendationCategory {
  OPTIMIZATIONS_AVAILABLE,
  OBSERVATIONS_REQUIRED,
  AT_TARGET,
}

export enum HealthSummaryWeightCategory {
  INCREASING,
  MISSING,
  STABLE,
}

export class HealthSummaryData {
  // Stored Properties

  name?: string
  dateOfBirth?: Date
  providerName?: string
  nextAppointment?: FHIRAppointment
  recommendations: UserMedicationRecommendation[]
  vitals: HealthSummaryVitals
  symptomScores: SymptomScore[]

  // Computed Properties

  get latestSymptomScore(): SymptomScore | null {
    return this.symptomScores.at(0) ?? null
  }

  get secondLatestSymptomScore(): SymptomScore | null {
    return this.symptomScores.at(1) ?? null
  }

  get symptomScoreCategory(): HealthSummarySymptomScoreCategory | null {
    const latestScore = this.latestSymptomScore
    const secondLatestScore = this.secondLatestSymptomScore

    if (latestScore === null || secondLatestScore === null) {
      return null
    }

    if (latestScore.overallScore >= 90) {
      return latestScore.overallScore - secondLatestScore.overallScore > -10 ?
          HealthSummarySymptomScoreCategory.ABOVE_90_STABLE_OR_IMPROVING
        : HealthSummarySymptomScoreCategory.ABOVE_90_WORSENING
    } else {
      return latestScore.overallScore - secondLatestScore.overallScore > -10 ?
          HealthSummarySymptomScoreCategory.BELOW_90_STABLE_OR_IMPROVING
        : HealthSummarySymptomScoreCategory.BELOW_90_WORSENING
    }
  }

  get weightCategory(): HealthSummaryWeightCategory {
    const weight = average(
      compactMap(this.vitals.bodyWeight, (observation) =>
        observation.unit.convert(observation.value, QuantityUnit.lbs),
      ),
    )
    if (weight.length < 2) return HealthSummaryWeightCategory.MISSING

    return true
  }

  get recommendationCategory(): HealthSummaryMedicationRecommendationCategory {
    const hasOptimizations = this.recommendations.some((recommendation) =>
      [
        UserMedicationRecommendationType.improvementAvailable,
        UserMedicationRecommendationType.notStarted,
      ].includes(recommendation.displayInformation.type),
    )
    if (hasOptimizations)
      return HealthSummaryMedicationRecommendationCategory.OPTIMIZATIONS_AVAILABLE

    const hasObservationsRequired = this.recommendations.some(
      (recommendation) =>
        [
          UserMedicationRecommendationType.moreLabObservationsRequired,
          UserMedicationRecommendationType.morePatientObservationsRequired,
        ].includes(recommendation.displayInformation.type),
    )
    if (hasObservationsRequired)
      return HealthSummaryMedicationRecommendationCategory.OBSERVATIONS_REQUIRED

    return HealthSummaryMedicationRecommendationCategory.AT_TARGET
  }

  get dizzinessWorsened(): boolean {
    const latestScore = this.latestSymptomScore?.dizzinessScore
    const secondLatestScore = this.secondLatestSymptomScore?.dizzinessScore

    return latestScore !== undefined && secondLatestScore !== undefined ?
        latestScore - secondLatestScore < -1
      : false
  }

  // Initialization

  constructor(input: {
    name?: string
    dateOfBirth?: Date
    providerName?: string
    nextAppointment?: FHIRAppointment
    recommendations: UserMedicationRecommendation[]
    vitals: HealthSummaryVitals
    symptomScores: SymptomScore[]
  }) {
    this.name = input.name
    this.dateOfBirth = input.dateOfBirth
    this.providerName = input.providerName
    this.nextAppointment = input.nextAppointment
    this.recommendations = input.recommendations
    this.vitals = input.vitals
    this.symptomScores = input.symptomScores
  }
}
