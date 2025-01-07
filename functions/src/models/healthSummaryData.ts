//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  average,
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
  STABLE_OR_DECREASING,
}

export enum HealthSummaryKeyPointMessage {
  OPTIMIZATIONS_AVAILABLE,
  MISSING_HEART_OBSERVATIONS,
  ON_TARGET_DOSE,
  SYMPTOMS_WORSENED,
  WEIGHT_INCREASED,
  DIZZINESS_WORSENED,
  MISSING_ALL_OBSERVATIONS,
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

  // Computed Properties - Key Points

  get keyPointMessages(): HealthSummaryKeyPointMessage[] {
    return []
  }

  // Computed Properties - Body Weight

  get latestBodyWeight(): number | null {
    return this.vitals.bodyWeight.at(0)?.value ?? null
  }

  get averageBodyWeight(): number | null {
    return (
      average(this.vitals.bodyWeight.map((observation) => observation.value)) ??
      null
    )
  }

  get bodyWeightRange(): number | null {
    const bodyWeightValues = this.vitals.bodyWeight.map(
      (observation) => observation.value,
    )
    const minWeight = Math.min(...bodyWeightValues)
    const maxWeight = Math.max(...bodyWeightValues)
    return isFinite(minWeight) && isFinite(maxWeight) ?
        maxWeight - minWeight
      : null
  }

  get weightCategory(): HealthSummaryWeightCategory {
    const averageWeight = this.averageBodyWeight
    const latestWeight = this.latestBodyWeight
    if (averageWeight === null || latestWeight === null)
      return HealthSummaryWeightCategory.MISSING

    return latestWeight - averageWeight > 1 ?
        HealthSummaryWeightCategory.INCREASING
      : HealthSummaryWeightCategory.STABLE_OR_DECREASING
  }

  // Computed Properties - Symptom Scores

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

  get dizzinessWorsened(): boolean {
    const latestScore = this.latestSymptomScore?.dizzinessScore
    const secondLatestScore = this.secondLatestSymptomScore?.dizzinessScore

    return latestScore !== undefined && secondLatestScore !== undefined ?
        latestScore - secondLatestScore < -1
      : false
  }

  // Computed Properties - Medication Recommendations

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
