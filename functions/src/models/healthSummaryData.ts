//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  advanceDateByDays,
  median,
  UserMedicationRecommendationType,
  type FHIRAppointment,
  type ObservationQuantity,
  type SymptomScore,
  type UserMedicationRecommendation,
} from "@stanfordbdhg/engagehf-models";
import {
  HealthSummaryDizzinessCategory,
  HealthSummaryMedicationRecommendationsCategory,
  HealthSummarySymptomScoreCategory,
  HealthSummaryWeightCategory,
} from "../healthSummary/keyPointsMessage.js";

export interface HealthSummaryVitals {
  systolicBloodPressure: ObservationQuantity[]
  diastolicBloodPressure: ObservationQuantity[]
  heartRate: ObservationQuantity[]
  bodyWeight: ObservationQuantity[]

  dryWeight?: ObservationQuantity
}

export class HealthSummaryData {
  // Stored Properties

  name?: string;
  dateOfBirth?: Date;
  providerName?: string;
  nextAppointment?: FHIRAppointment;
  recommendations: UserMedicationRecommendation[];
  vitals: HealthSummaryVitals;
  symptomScores: SymptomScore[];
  now: Date;

  // Computed Properties - Body Weight

  get latestBodyWeight(): number | null {
    return this.vitals.bodyWeight.at(0)?.value ?? null;
  }

  get lastSevenDayMedianBodyWeight(): number | null {
    const bodyWeightValues = this.vitals.bodyWeight
      .filter(
        (observation) => observation.date >= advanceDateByDays(this.now, -7),
      )
      .map((observation) => observation.value);
    return median(bodyWeightValues) ?? null;
  }

  get bodyWeightRange(): [number, number] | null {
    const bodyWeightValues = this.vitals.bodyWeight.map(
      (observation) => observation.value,
    );
    const minWeight = Math.min(...bodyWeightValues);
    const maxWeight = Math.max(...bodyWeightValues);
    return isFinite(minWeight) && isFinite(maxWeight) ?
        [minWeight, maxWeight]
      : null;
  }

  // Computed Properties - Symptom Scores

  get latestSymptomScore(): SymptomScore | null {
    return this.symptomScores.at(0) ?? null;
  }

  get secondLatestSymptomScore(): SymptomScore | null {
    return this.symptomScores.at(1) ?? null;
  }

  // Computed Properties - KeyPoints

  get dizzinessCategory(): HealthSummaryDizzinessCategory {
    const latestScore = this.latestSymptomScore?.dizzinessScore ?? null;
    const secondLatestScore =
      this.secondLatestSymptomScore?.dizzinessScore ?? null;

    if (latestScore === null || secondLatestScore === null)
      return HealthSummaryDizzinessCategory.INADEQUATE;

    return latestScore - secondLatestScore < 0 ?
        HealthSummaryDizzinessCategory.WORSENING
      : HealthSummaryDizzinessCategory.STABLE_OR_IMPROVING;
  }

  get recommendationsCategory(): HealthSummaryMedicationRecommendationsCategory | null {
    const hasOptimizations = this.recommendations.some((recommendation) =>
      [
        UserMedicationRecommendationType.improvementAvailable,
        UserMedicationRecommendationType.notStarted,
      ].includes(recommendation.displayInformation.type),
    );
    if (hasOptimizations)
      return HealthSummaryMedicationRecommendationsCategory.OPTIMIZATIONS_AVAILABLE;

    const hasLabObservationsRequired = this.recommendations.some(
      (recommendation) =>
        [UserMedicationRecommendationType.moreLabObservationsRequired].includes(
          recommendation.displayInformation.type,
        ),
    );
    const hasPatientObservationsRequired = this.recommendations.some(
      (recommendation) =>
        [
          UserMedicationRecommendationType.morePatientObservationsRequired,
        ].includes(recommendation.displayInformation.type),
    );
    if (hasLabObservationsRequired && hasPatientObservationsRequired)
      return HealthSummaryMedicationRecommendationsCategory.OBSERVATIONS_REQUIRED;
    if (hasLabObservationsRequired)
      return HealthSummaryMedicationRecommendationsCategory.LAB_OBSERVATIONS_REQUIRED;
    if (hasPatientObservationsRequired)
      return HealthSummaryMedicationRecommendationsCategory.PATIENT_OBSERVATIONS_REQUIRED;

    const hasAtTarget = this.recommendations.some((recommendation) =>
      [
        UserMedicationRecommendationType.personalTargetDoseReached,
        UserMedicationRecommendationType.targetDoseReached,
      ].includes(recommendation.displayInformation.type),
    );
    return hasAtTarget ?
        HealthSummaryMedicationRecommendationsCategory.AT_TARGET
      : null;
  }

  get symptomScoreCategory(): HealthSummarySymptomScoreCategory {
    const latestScore = this.latestSymptomScore;
    const secondLatestScore = this.secondLatestSymptomScore;

    if (latestScore === null || secondLatestScore === null)
      return HealthSummarySymptomScoreCategory.INADEQUATE;

    if (latestScore.overallScore - secondLatestScore.overallScore <= -10)
      return HealthSummarySymptomScoreCategory.WORSENING;

    if (latestScore.overallScore < 90)
      return HealthSummarySymptomScoreCategory.LOW_STABLE_OR_IMPROVING;

    return HealthSummarySymptomScoreCategory.HIGH_STABLE_OR_IMPROVING;
  }

  get weightCategory(): HealthSummaryWeightCategory {
    const medianWeight = this.lastSevenDayMedianBodyWeight;
    const latestWeight = this.latestBodyWeight;
    if (medianWeight === null || latestWeight === null)
      return HealthSummaryWeightCategory.MISSING;

    return latestWeight - medianWeight >= 3 ?
        HealthSummaryWeightCategory.INCREASING
      : HealthSummaryWeightCategory.STABLE_OR_DECREASING;
  }

  // Initialization

  constructor(input: {
    name?: string;
    dateOfBirth?: Date;
    providerName?: string;
    nextAppointment?: FHIRAppointment;
    recommendations: UserMedicationRecommendation[];
    vitals: HealthSummaryVitals;
    symptomScores: SymptomScore[];
    now: Date;
  }) {
    this.name = input.name;
    this.dateOfBirth = input.dateOfBirth;
    this.providerName = input.providerName;
    this.nextAppointment = input.nextAppointment;
    this.recommendations = input.recommendations;
    this.vitals = input.vitals;
    this.symptomScores = input.symptomScores;
    this.now = input.now;
  }
}
