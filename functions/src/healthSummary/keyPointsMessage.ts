//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  Lazy,
  type LocalizedText,
  localizedTextConverter,
} from '@stanfordbdhg/engagehf-models'
import { z } from 'zod/v4'

export enum HealthSummarySymptomScoreCategory {
  HIGH_STABLE_OR_IMPROVING = 'Change >-10 and KCCQ>=90',
  LOW_STABLE_OR_IMPROVING = 'Change >-10 and KCCQ<90',
  WORSENING = 'Change <-10',
  INADEQUATE = 'Inadequate KCCQ data',
}

export enum HealthSummaryMedicationRecommendationsCategory {
  OPTIMIZATIONS_AVAILABLE = 'Eligible meds for optimization',
  PATIENT_OBSERVATIONS_REQUIRED = 'No eligible meds at optimization; measure BP',
  LAB_OBSERVATIONS_REQUIRED = 'No eligible meds at optimization; measure labs',
  OBSERVATIONS_REQUIRED = 'No eligible meds at optimization; measure BP and labs',
  AT_TARGET = 'No eligible meds at optimization; at target doses',
}

export enum HealthSummaryWeightCategory {
  INCREASING = 'Weight increase',
  MISSING = 'No weight measured',
  STABLE_OR_DECREASING = 'No weight gain but weight measured',
}

export enum HealthSummaryDizzinessCategory {
  WORSENING = 'Decrease <-25',
  STABLE_OR_IMPROVING = 'No decrease <-25',
  INADEQUATE = 'Inadequate dizziness data',
}

export interface HealthSummaryKeyPointMessage {
  recommendationsCategory: HealthSummaryMedicationRecommendationsCategory
  symptomScoreCategory: HealthSummarySymptomScoreCategory
  dizzinessCategory: HealthSummaryDizzinessCategory
  weightCategory: HealthSummaryWeightCategory
  texts: LocalizedText[]
}

export function healthSummaryKeyPointTexts(input: {
  recommendations: HealthSummaryMedicationRecommendationsCategory
  symptomScore: HealthSummarySymptomScoreCategory
  dizziness: HealthSummaryDizzinessCategory
  weight: HealthSummaryWeightCategory
}): LocalizedText[] | null {
  return (
    healthSummaryKeyPointMessages.value.find(
      (message) =>
        message.recommendationsCategory === input.recommendations &&
        message.symptomScoreCategory === input.symptomScore &&
        message.dizzinessCategory === input.dizziness &&
        message.weightCategory === input.weight,
    )?.texts ?? null
  )
}

export const healthSummaryKeyPointMessages = new Lazy<
  HealthSummaryKeyPointMessage[]
>(() =>
  z
    .object({
      recommendationsCategory: z.nativeEnum(
        HealthSummaryMedicationRecommendationsCategory,
      ),
      symptomScoreCategory: z.nativeEnum(HealthSummarySymptomScoreCategory),
      dizzinessCategory: z.nativeEnum(HealthSummaryDizzinessCategory),
      weightCategory: z.nativeEnum(HealthSummaryWeightCategory),
      texts: z.array(localizedTextConverter.schema),
    })
    .array()
    .parse([
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Inadequate KCCQ data',
        dizzinessCategory: 'Inadequate dizziness data',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can help you feel better and strengthen your heart. Do not forget to keep doing your symptom checks.",
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Inadequate KCCQ data',
        dizzinessCategory: 'Inadequate dizziness data',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart. Do not forget to keep doing your symptom checks.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Inadequate KCCQ data',
        dizzinessCategory: 'Inadequate dizziness data',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to help you feel better and strengthen your heart. Do not forget to keep doing your symptom checks.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Inadequate KCCQ data',
        dizzinessCategory: 'Inadequate dizziness data',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart. Also discuss checking your labs with your care team. Do not forget to keep doing your symptom checks.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Inadequate KCCQ data',
        dizzinessCategory: 'Inadequate dizziness data',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines at this time. Your weight is not rising. Make sure to keep taking your heart meds to help you feel better and strengthen your heart. Do not forget to keep doing your symptom checks.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Inadequate KCCQ data',
        dizzinessCategory: 'Inadequate dizziness data',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can help you feel better and strengthen your heart.",
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Changing your heart medicines can lower your risk of having fluid gain in the future by strengthening your heart. Do not forget to keep doing your symptom checks.',
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Inadequate KCCQ data',
        dizzinessCategory: 'Inadequate dizziness data',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Do not forget to keep doing your symptom checks.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Inadequate KCCQ data',
        dizzinessCategory: 'Inadequate dizziness data',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart. Also discuss checking your labs with your care team.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Do not forget to keep doing your symptom checks.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Inadequate KCCQ data',
        dizzinessCategory: 'Inadequate dizziness data',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to help you feel better and strengthen your heart.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Do not forget to keep doing your symptom checks.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Inadequate KCCQ data',
        dizzinessCategory: 'Inadequate dizziness data',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines at this time. Your symptoms are stable and your weight is not rising. Make sure to keep taking your heart meds to help you feel better and strengthen your heart.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Taking your heart medicines can lower your risk of having fluid gain in the future by strengthening your heart. Do not forget to keep doing your symptom checks.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Inadequate KCCQ data',
        dizzinessCategory: 'Inadequate dizziness data',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can help you feel better and strengthen your heart. Do not forget to keep doing your symptom checks and weight checks.",
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Inadequate KCCQ data',
        dizzinessCategory: 'Inadequate dizziness data',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart. Do not forget to keep doing your symptom checks and weight checks.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Inadequate KCCQ data',
        dizzinessCategory: 'Inadequate dizziness data',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart. Also discuss checking your labs with your care team. Do not forget to keep doing your symptom checks and weight checks.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Inadequate KCCQ data',
        dizzinessCategory: 'Inadequate dizziness data',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to help you feel better and strengthen your heart. Do not forget to keep doing your symptom checks and weight checks.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Inadequate KCCQ data',
        dizzinessCategory: 'Inadequate dizziness data',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines at this time. Your symptoms are stable and your weight is not rising. Make sure to keep taking your heart meds to help you feel better and strengthen your heart. Do not forget to keep doing your symptom checks and weight checks.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can help you feel better and strengthen your heart.",
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart. heart. Also, discuss checking your labs with your care team.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to help you feel better and strengthen your heart.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines at this time. Your symptoms are stable and your weight is not rising. Make sure to keep taking your heart meds to help you feel better and strengthen your heart.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can keep you feeling well and strengthen your heart.",
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to keep you feeling well and strengthen your heart.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to keep you feeling well and strengthen your heart. Also, discuss checking your labs with your care team.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to keep you feeling well and strengthen your heart.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines at this time. Your symptoms are stable and your weight is not rising. Make sure to keep taking your heart meds to keep you feeling well and strengthen your heart.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can help you start feeling better and strengthen your heart.",
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Discuss with your care team how adjusting your medications can help you feel better.',
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you start feeling better and strengthen your heart.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your blood pressure and heart rate and discuss with your care team how adjusting your medicines can help you feel better.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you start feeling better and strengthen your heart. Also discuss checking your labs with your care team.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your blood pressure and heart rate and discuss with your care team how adjusting your medicines can help you feel better.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to help you start feeling better and strengthen your heart.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Discuss with your care team how adjusting your medicines can help you feel better.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines at this time. Make sure to keep taking your heart meds to strengthen your heart.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Discuss potential options for helping you feel better with your care team.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can help you feel better and strengthen your heart.",
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss options with your care team for improving your dizziness and watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure and heart rate more frequently and discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart. Also discuss checking your labs with your care team.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure and heart rate more frequently and discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to help you start feeling better and strengthen your heart.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines at this time. Your symptoms are stable and your weight is not rising. Make sure to keep taking your heart meds to help you feel better and strengthen your heart.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss ways to improve your dizziness with your care team. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can keep you feeling well and strengthen your heart.",
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to keep you feeling well and strengthen your heart.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure and heart rate more frequently and discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to keep you feeling well and strengthen your heart. Also discuss checking your labs with your care team.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure and heart rate more frequently and discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to keep you feeling well and strengthen your heart.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines at this time. Your symptoms are stable and your weight is not rising. Make sure to keep taking your heart meds to keep you feeling well and strengthen your heart.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can help you start feeling better and strengthen your heart.",
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Discuss with your care team how adjusting your medications can help you feel better.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you start feeling better and strengthen your heart.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your blood pressure and heart rate and discuss with your care team how adjusting your medicines can help you feel better.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure and heart rate and discuss ways to improve your dizziness with your care team. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you start feeling better and strengthen your heart. Also discuss checking your labs with your care team.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your blood pressure and heart rate and discuss with your care team how adjusting your medicines can help you feel better.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure and heart rate and discuss ways to improve your dizziness with your care team. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to help you start feeling better and strengthen your heart.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Discuss with your care team how adjusting your medicines can help you feel better.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss ways to improve your dizziness with your care team. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight gain but weight measured',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines at this time. Make sure to keep taking your heart meds to strengthen your heart.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Discuss with your care team potential options for helping you feel better.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss ways to improve your dizziness with your care team. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can help you feel better and strengthen your heart.",
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Changing your heart medicines can lower your risk of having fluid gain in the future by strengthening your heart.',
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart. Also discuss checking your labs with your care team.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to help you start feeling better and strengthen your heart.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines at this time. Your symptoms are stable and your weight is not rising. Make sure to keep taking your heart meds to help you feel better and strengthen your heart.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Taking your heart medicines can lower your risk of having fluid gain in the future by strengthening your heart.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can keep you feeling well and strengthen your heart.",
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Changing your heart medicines can lower your risk of having fluid gain in the future by strengthening your heart.',
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to keep you feeling well and strengthen your heart.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to keep you feeling well and strengthen your heart. Also discuss checking your labs with your care team.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to keep you feeling well and strengthen your heart.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines and your symptoms are stable at this time. Make sure to keep taking your heart meds to keep you feeling well and strengthen your heart.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Taking your heart medicines can lower your risk of having fluid gain in the future by strengthening your heart.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can help you start feeling better and strengthen your heart.",
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Discuss with your care team how adjusting your medications can help you feel better.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Changing your heart medicines can lower your risk of having fluid gain in the future by strengthening your heart.',
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you start feeling better and strengthen your heart.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your blood pressure and heart rate and discuss with your care team how adjusting your medicines can help you feel better.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you start feeling better and strengthen your heart. Also discuss checking your labs with your care team.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your blood pressure and heart rate and discuss with your care team how adjusting your medicines can help you feel better.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to help you start feeling better and strengthen your heart.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Discuss with your care team how adjusting your medicines can help you feel better.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines at this time. Make sure to keep taking your heart meds to strengthen your heart.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Discuss with your care team potential options for helping you feel better.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Taking your heart medicines can lower your risk of having fluid gain in the future by strengthening your heart.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can help you feel better and strengthen your heart.",
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Changing your heart medicines can lower your risk of having fluid gain in the future by strengthening your heart.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss ways to improve your dizziness with your care team and watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure and heart rate more frequently and discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart. Also discuss checking your labs with your care team.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure and heart rate more frequently and discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to help you feel better and strengthen your heart.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines and your symptoms are stable at this time. Make sure to keep taking your heart meds to help you feel better and strengthen your heart.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Taking your heart medicines can lower your risk of having fluid gain in the future by strengthening your heart.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss ways to improve your dizziness with your care team. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can keep you feeling well and strengthen your heart.",
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Changing your heart medicines can lower your risk of having fluid gain in the future by strengthening your heart.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss options with your care team for improving your dizziness and watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to keep you feeling well and strengthen your heart.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure and heart rate more frequently and discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to keep you feeling well and strengthen your heart. Also discuss checking your labs with your care team.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure and heart rate more frequently and discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to keep you feeling well and strengthen your heart.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines and your symptoms are stable at this time. Make sure to keep taking your heart meds to keep you feeling well and strengthen your heart.',
          },
          {
            en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Taking your heart medicines can lower your risk of having fluid gain in the future by strengthening your heart.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss ways to improve your dizziness with your care team. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can help you start feeling better and strengthen your heart.",
          },
          {
            en: 'Your heart symptoms worsened (see symptom report) and your weight increased. Discuss with your care team how adjusting your medications can help you feel better.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Would discuss ways to improve your dizziness with your care team. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you start feeling better and strengthen your heart.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report) and your weight increased. Check your blood pressure and heart rate and discuss with your care team how adjusting your medicines can help you feel better.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure and heart rate and discuss ways to improve your dizziness with your care team. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you start feeling better and strengthen your heart. Also discuss checking your labs with you care team.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report) and your weight increased. Check your blood pressure and heart rate and discuss with your care team how adjusting your medicines can help you feel better.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure and heart rate and discuss ways to improve your dizziness with your care team. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to keep you start feeling better and strengthen your heart.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report) and your weight increased. Discuss with your care team how adjusting your medicines can help you feel better.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss ways to improve your dizziness with your care team. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'Weight increase',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines at this time. Make sure to keep taking your heart meds to strengthen your heart.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report) and your weight increased. Discuss with your care team potential options for helping you feel better.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss ways to improve your dizziness with your care team. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can help you feel better and strengthen your heart. Also, do not forget to keep doing your weight checks.",
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart. Also do not forget to keep doing your weight checks.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart. Also do not forget to keep doing your weight checks. Discuss checking your labs with your care team.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to help you feel better and strengthen your heart. Also do not forget to keep doing your weight checks.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines and your symptoms are stable at this time. Make sure to keep taking your heart meds to help you feel better and strengthen your heart. Do not forget to keep doing your weight checks.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can keep you feeling well and strengthen your heart. Do not forget to keep doing your weight checks.",
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to keep you feeling well and strengthen your heart. Also do not forget to keep doing your weight checks.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to keep you feeling well and strengthen your heart. Also do not forget to keep doing your weight checks. Discuss checking your labs with your care team.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to keep you feeling well and strengthen your heart. Also do not forget to keep doing your weight checks.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines and your symptoms are stable at this time. Make sure to keep taking your heart meds to keep you feeling well and strengthen your heart. Do not forget to keep doing your weight checks.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can help you start feeling better and strengthen your heart.",
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your weight more frequently and discuss with your care team how adjusting your medications can help you feel better.',
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you start feeling better and strengthen your heart.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your blood pressure, heart rate, and weight more frequently, and discuss with your care team how adjusting your medicines can help you feel better.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you start feeling better and strengthen your heart. Also do not forget to keep doing your weight checks. Discuss checking your labs with your care team.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your blood pressure, heart rate, and weight more frequently, and discuss with your care team how adjusting your medicines can help you feel better.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to help you start feeling better and strengthen your heart. Also do not forget to keep doing your weight checks.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your weight more frequently and discuss with your care team how adjusting your medicines can help you feel better.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'No decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines at this time. Make sure to keep taking your heart meds to strengthen your heart. Also do not forget to keep doing your weight checks.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your weight more frequently and discuss with your care team potential options for helping you feel better.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can help you feel better and strengthen your heart. Also do not forget to keep doing your weight checks.",
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your weight more frequently and discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart. Also do not forget to keep doing your weight checks.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure, heart rate, and weight more frequently and discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart. Also discuss checking your labs with you care team. Do not forget to keep doing your weight checks.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure, heart rate, and weight more frequently and discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to help you feel better and strengthen your heart. Also do not forget to keep doing your weight checks.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change >-10 and KCCQ<90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines and your symptoms are stable at this time. Make sure to keep taking your heart meds to help you feel better and strengthen your heart. Do not forget to keep doing your weight checks.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your weight and discuss ways to improve your dizziness with your care team. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can keep you feeling well and strengthen your heart. Also, do not forget to keep doing your weight checks.",
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your weight more frequently and discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Check your blood pressure and heart rate multiple times a week to understand if your heart medicines can be adjusted to keep you feeling well and strengthen your heart. Also, do not forget to keep doing your weight checks.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure, heart rate, and weight more frequently and discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Check your blood pressure and heart rate multiple times a week to understand if your heart medicines can be adjusted to keep you feeling well and strengthen your heart. Also discuss checking your labs with your care team. Do not forget to keep doing your weight checks.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your blood pressure, heart rate, and weight more frequently and discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to keep you feeling well and strengthen your heart. Also do not forget to keep doing your weight checks.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss options with your care team for improving your dizziness. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change >-10 and KCCQ>=90',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines and your symptoms are stable at this time. Make sure to keep taking your heart meds to keep you feeling well and strengthen your heart. Also, do not forget to keep doing your weight checks.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Check your weight more frequently and discuss ways to improve your dizziness with your care team. Also watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'Eligible meds for optimization',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: "There are possible options to improve your heart medicines. See the list of 'Potential Med Changes' below to discuss these options with your care team. These meds can help you start feeling better and strengthen your heart. Also, do not forget to keep doing your weight checks.",
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your weight more frequently and discuss with your care team how adjusting your meds can help you feel better.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss ways to improve your dizziness with your care team and watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory: 'No eligible meds at optimization; measure BP',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you start feeling better and strengthen your heart. Also, do not forget to keep doing your weight checks.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your blood pressure, heart rate, and weight more frequently and discuss with your care team how adjusting your meds can help you feel better.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss ways to improve your dizziness with your care team and watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure BP and labs',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you start feeling better and strengthen your heart. Also discuss checking your labs with your care team. Do not forget to keep doing your weight checks',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your blood pressure, heart rate, and weight more frequently and discuss with your care team how adjusting your meds can help you feel better.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss ways to improve your dizziness with your care team and watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; measure labs',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'We are missing recent lab data. Discuss checking your labs with your care team to understand if your medications can be adjusted to keep you start feeling better and strengthen your heart. Also do not forget to keep doing your weight checks.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your weight more frequently and discuss with your care team how adjusting your meds can help you feel better.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss ways to improve your dizziness with your care team and watch the dizziness educational video.',
          },
        ],
      },
      {
        recommendationsCategory:
          'No eligible meds at optimization; at target doses',
        symptomScoreCategory: 'Change <-10',
        dizzinessCategory: 'Decrease <-25',
        weightCategory: 'No weight measured',
        texts: [
          {
            en: 'Great news! You are on the target dose for your heart medicines at this time. Make sure to keep taking your heart meds to strengthen your heart. Also, do not forget to keep doing your weight checks.',
          },
          {
            en: 'Your heart symptoms worsened (see symptom report). Check your weight more frequently and discuss with your care team options for helping you feel better.',
          },
          {
            en: 'You are noting your dizziness is more bothersome. Discuss ways to improve your dizziness with your care team and watch the dizziness educational video.',
          },
        ],
      },
    ]),
)
