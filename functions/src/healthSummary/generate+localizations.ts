//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  LocalizedText,
  type UserMedicationRecommendationDoseSchedule,
  type FHIRAppointment,
  SymptomScore,
  UserMedicationRecommendationType,
} from '@stanfordbdhg/engagehf-models'
import { HealthSummaryData } from '../models/healthSummaryData'

export function healthSummaryLocalizations(languages: string[]) {
  function localize(strings: Record<string, string>): string {
    return new LocalizedText(strings).localize(...languages)
  }
  return {
    header: {
      title: localize({
        en: 'ENGAGE-HF Health Summary',
      }),
      dateOfBirthLine(date: Date | null) {
        return localize({
          en: `DOB: ${date !== null ? formatDate(date) : '---'}`,
        })
      },
      providerLine(name: string | null) {
        return localize({
          en: `Provider: ${name ?? '---'}`,
        })
      },
      nextAppointmentLine(appointment: FHIRAppointment | null) {
        const date = appointment?.start
        const providerNames = appointment?.providerNames ?? []
        const providerText =
          providerNames.length === 0 ? '' : providerNames.join(', ') + ' '
        return localize({
          en: `Next Appointment: ${providerText}${date !== undefined ? `${formatDate(date)} at ${formatTime(date)}` : '---'}`,
        })
      },
      pageNumberTitle(number: number) {
        return localize({
          en: `Page ${number}`,
        })
      },
    },
    keyPointsSection: {
      title: localize({
        en: 'KEY POINTS',
      }),
      messageTexts: {
        optimizationsAvailable: localize({
          en: 'There are possible options to improve your heart medicines. See the list of "Potential Med Changes" below to discuss these options with your care team. These meds can help you feel better and strengthen your heart.',
        }),
        missingHeartObservations: localize({
          en: 'We are missing blood pressure and heart rate checks in the last two weeks. Try to check your blood pressure and heart rate multiple times a week to understand if your medications can be adjusted to help you feel better and strengthen your heart.',
        }),
        onTargetDose: localize({
          en: 'Great news! You are on the target dose for your heart medicines at this time. Your symptoms are stable, and your weight is not rising. Make sure to keep taking your heart meds to help you feel better and strengthen your heart.',
        }),
        symptomsWorsened: localize({
          en: 'Your heart symptoms worsened (see symptom report). Discuss with your care team how adjusting your medications can help you feel better.',
        }),
        weightIncreased: localize({
          en: 'Your weight is increasing. This is a sign that you may be retaining fluid. Discuss with your care team and watch the weight educational video. Changing your heart medicines can lower your risk of having fluid gain in the future by strengthening your heart.',
        }),
        dizzinessIncreased: localize({
          en: 'Your dizziness is more bothersome. Discuss with your care team options to improve your dizziness, and watch the dizziness educational video.',
        }),
        missingAllObservations: localize({
          en: 'Check your blood pressure, heart rate, and weight more frequently and discuss with your care team how adjusting your medicines can help you feel better.',
        }),
      },
      messages(data: HealthSummaryData): string[] {
        const currentScore = data.symptomScores.at(0)
        const previousScore = data.symptomScores.at(1)
        const scoreAbove90 =
          currentScore !== undefined ?
            currentScore.overallScore >= 90
          : undefined
        const scoreDecreased =
          currentScore !== undefined && previousScore !== undefined ?
            currentScore.overallScore - previousScore.overallScore < -10
          : undefined
        const dizzinessScoreIncreased =
          currentScore !== undefined && previousScore !== undefined ?
            currentScore.dizzinessScore - previousScore.dizzinessScore > 1
          : undefined

        const optimizingRecommendations = data.recommendations.filter(
          (recommendation) =>
            [
              UserMedicationRecommendationType.notStarted,
              UserMedicationRecommendationType.improvementAvailable,
            ].includes(recommendation.displayInformation.type),
        )
        const observationsRequiredRecommendations = data.recommendations.filter(
          (recommendation) =>
            [
              UserMedicationRecommendationType.moreLabObservationsRequired,
              UserMedicationRecommendationType.morePatientObservationsRequired,
            ].includes(recommendation.displayInformation.type),
        )
        const recommendationsAtTargetDose = data.recommendations.filter(
          (recommendation) =>
            recommendation.displayInformation.type ===
            UserMedicationRecommendationType.targetDoseReached,
        )

        const result: string[] = []

        if (optimizingRecommendations.length > 0) {
          result.push(this.messageTexts.optimizationsAvailable)
        } else if (observationsRequiredRecommendations.length > 0) {
          result.push(this.messageTexts.missingHeartObservations)
        }

        if (scoreDecreased === true) {
          result.push(this.messageTexts.symptomsWorsened)
        } else if (scoreDecreased === false && scoreAbove90 === true) {
          result.push(this.messageTexts.weightIncreased)
        } else if (scoreDecreased === false && scoreAbove90 === false) {
          result.push(this.messageTexts.onTargetDose)
        }

        if (result.length === 0) {
          result.push(this.messageTexts.onTargetDose)
        }

        return []
      },
    },
    currentMedicationsSection: {
      title: localize({
        en: 'CURRENT HEART MEDICATIONS',
      }),
      description: localize({
        en: 'Here are meds you are taking for your heart function, your current dose, and the target dose that we aim to get to. The target dose is the dose we know best helps strengthen your heart.',
      }),
      table: {
        nameHeader: localize({
          en: 'My Medications',
        }),
        currentDoseHeader: localize({
          en: 'Current Dose',
        }),
        targetDoseHeader: localize({
          en: 'Target Dose',
        }),
        doseSchedule(
          schedule: UserMedicationRecommendationDoseSchedule,
          unit: string,
        ): string {
          const prefix =
            schedule.quantity.map((quantity) => quantity.toString()).join('/') +
            ' ' +
            unit +
            ' '
          switch (schedule.frequency) {
            case 1:
              return localize({
                en: prefix + 'daily',
              })
            case 2:
              return localize({
                en: prefix + 'twice daily',
              })
            default:
              return localize({
                en: prefix + `${schedule.frequency}x daily`,
              })
          }
        },
      },
    },
    medicationRecommendationsSection: {
      title: localize({
        en: 'POTENTIAL MED CHANGES TO HELP HEART',
      }),
      description: localize({
        en: 'These potential changes are based on your meds, vital signs, and lab values. These changes are expected to help your heart work better. Discuss these potential changes with your care team at your next clinic appointment.',
      }),
      hint: localize({
        en: 'Aim to make one positive change!',
      }),
    },
    symptomScoresSummarySection: {
      title: localize({
        en: 'SYMPTOM [KCCQ-12] REPORT',
      }),
      description: localize({
        en: 'These symptom scores range from 0-100. 0 indicates severe symptoms. 100 indicates you are doing extremely well. Blue line is current and grey line is previous. This is the overall score. The Overall Score is an average of physical limits, social limits, quality of life, and symptoms. Detailed results for each are on the Table on page 2.',
      }),
      personalSummary(input: {
        previousScore: SymptomScore | null
        currentScore: SymptomScore | null
      }): string | undefined {
        const currentScore = input.currentScore
        const previousScore = input.previousScore
        if (currentScore !== null && previousScore !== null) {
          const currentScoreText = currentScore.overallScore.toString() + '%'
          const previousScoreText = previousScore.overallScore.toString() + '%'

          if (currentScore.overallScore >= 90) {
            if (currentScore.overallScore - previousScore.overallScore >= 10) {
              return localize({
                en: `Your heart symptoms score increased from ${previousScoreText} to ${currentScoreText}. This means you are feeling better. Your score is overall very good. Continuing to take your meds will be important for keeping you feeling well.`,
              })
            } else {
              return localize({
                en: 'Your heart symptom score remains very good. Continuing to take your meds will be important for keeping you feeling well.',
              })
            }
          } else {
            const improvement =
              currentScore.overallScore - previousScore.overallScore
            if (improvement >= 10) {
              return localize({
                en: `Your heart symptoms score increased from ${previousScoreText} to ${currentScoreText}. This means you have been feeling better. There is still room to continue improving how you feel. Getting on the best doses of heart failure medicines can help you feeling better. Consider discussing further with your care team.`,
              })
            } else if (improvement > -10) {
              return localize({
                en: 'Your heart symptom score is stable. There is still room to continue improving how you feel. Getting on the best doses of heart failure medicines can help you feeling better. Consider discussing further with your care team.',
              })
            } else {
              return localize({
                en: `Your heart symptoms score decreased from ${previousScoreText} to ${currentScoreText}. This means you are feeling worse. Consider talking to your care team about adjusting your heart failure medications as these have been shown to decrease symptoms long term.`,
              })
            }
          }
        }
        return undefined
      },
    },
    symptomScoresTableSection: {
      title: localize({
        en: 'Symptom Scores [KCCQ-12] Over Time',
      }),
      description: localize({
        en: 'This is a detailed report of your symptom scores over time. The graph above shows the overall score. 100 is better and 0 is worse. Each KCCQ-12 question is from one of these categories. Your Overall Score is the average of the other categories.',
      }),
      dateHeader: localize({
        en: '',
      }),
      overallScoreHeader: localize({
        en: 'Overall Score',
      }),
      physicalLimitsScoreHeader: localize({
        en: 'Physical Limits',
      }),
      socialLimitsScoreHeader: localize({
        en: 'Social Limits',
      }),
      qualityOfLifeScoreHeader: localize({
        en: 'Quality of Life',
      }),
      symptomFrequencyScoreHeader: localize({
        en: 'Heart Failure Symptoms',
      }),
      dizzinessScoreHeader: localize({
        en: 'Dizziness',
      }),
      formatDate(date: Date) {
        return formatDate(date)
      },
    },
    vitalsSection: {
      title: localize({
        en: 'VITALS OVER LAST 2 WEEKS',
      }),
      bodyWeightTitle: localize({
        en: 'Weight',
      }),
      bodyWeightTable: {
        titleHeader: localize({
          en: '',
        }),
        currentHeader: localize({
          en: 'Current',
        }),
        sevenDayAverageHeader: localize({
          en: '7-Day Average',
        }),
        lastVisitHeader: localize({
          en: 'Last Visit',
        }),
        rangeHeader: localize({
          en: 'Range',
        }),
        rowTitle: localize({
          en: 'Weight',
        }),
      },
      heartRateTitle: localize({
        en: 'Heart Rate',
      }),
      heartRateTable: {
        titleHeader: localize({
          en: '',
        }),
        medianHeader: localize({
          en: 'Median',
        }),
        iqrHeader: localize({
          en: 'IQR',
        }),
        percentageUnder50Header: localize({
          en: '% Under 50',
        }),
        percentageOver120Header: localize({
          en: '% Over 120',
        }),
        rowTitle: localize({
          en: 'Heart Rate',
        }),
      },
      systolicBloodPressureTitle: localize({
        en: 'Systolic Blood Pressure',
      }),
      diastolicBloodPressureTitle: localize({
        en: 'Diastolic Blood Pressure',
      }),
      bloodPressureTable: {
        titleHeader: localize({
          en: '',
        }),
        medianHeader: localize({
          en: 'Median',
        }),
        iqrHeader: localize({
          en: 'IQR',
        }),
        percentageUnder90Header: localize({
          en: '% Under 90 mmHg',
        }),
        percentageOver180Header: localize({
          en: '% Over 180 mmHg',
        }),
        systolicRowTitle: localize({
          en: 'Systolic',
        }),
        diastolicRowTitle: localize({
          en: 'Diastolic',
        }),
      },
    },
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
