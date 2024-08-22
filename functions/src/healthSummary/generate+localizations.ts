//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { LocalizedText, type QuantityUnit } from '@stanfordbdhg/engagehf-models'

export function healthSummaryLocalizations(languages: string[]) {
  return {
    header: {
      title: new LocalizedText({
        en: 'ENGAGE-HF Mobile App Health Summary',
      }).localize(...languages),
      dateOfBirthLine(date: Date | null) {
        return new LocalizedText({
          en: `DOB: ${date !== null ? formatDate(date) : '---'}`,
        }).localize(...languages)
      },
      clinicianLine(name: string | null) {
        return new LocalizedText({
          en: `Provider: ${name ?? '---'}`,
        }).localize(...languages)
      },
      nextAppointmentLine(date: Date | null) {
        return new LocalizedText({
          en: `Next Appointment: ${date !== null ? formatDate(date) : '---'}`,
        }).localize(...languages)
      },
      pageNumberTitle(number: number) {
        return new LocalizedText({
          en: `Page ${number}`,
        }).localize(...languages)
      },
    },
    medicationsSection: {
      title: new LocalizedText({
        en: 'MEDICATIONS',
      }).localize(...languages),
      currentTitle: new LocalizedText({
        en: 'Current Medications',
      }).localize(...languages),
      currentText: new LocalizedText({
        en: 'Before your next clinic appointment, check off which medications you have been taking below:',
      }).localize(...languages),
      recommendationsTitle: new LocalizedText({
        en: 'Potential Positive Changes',
      }).localize(...languages),
      recommendationsText: new LocalizedText({
        en: 'Please discuss optimizing these medications with your care them at your next clinic appointment.',
      }).localize(...languages),
      recommendationsHint: new LocalizedText({
        en: 'Aim to make one positive change!',
      }).localize(...languages),
    },
    medicationsTable: {
      nameHeader: new LocalizedText({
        en: 'My medications',
      }).localize(...languages),
      doseHeader: new LocalizedText({
        en: 'Dose',
      }).localize(...languages),
      targetDoseHeader: new LocalizedText({
        en: 'Target dose',
      }).localize(...languages),
      recommendationHeader: new LocalizedText({
        en: 'Potential Positive Change',
      }).localize(...languages),
      commentsHeader: new LocalizedText({
        en: 'Questions/Comments',
      }).localize(...languages),
    },
    vitalsSection: {
      title: new LocalizedText({
        en: 'VITALS OVER LAST 2 WEEKS',
      }).localize(...languages),
      averageSystolicText(number: number | null) {
        const observationText = formatValue(number, null, {
          fractionalDigitCount: 0,
        })
        return new LocalizedText({
          en: `Average Systolic Blood Pressure: ${observationText}`,
        }).localize(...languages)
      },
      averageDiastolicText(number: number | null) {
        const observationText = formatValue(number, null, {
          fractionalDigitCount: 0,
        })
        return new LocalizedText({
          en: `Average Diastolic Blood Pressure: ${observationText}`,
        }).localize(...languages)
      },
      averageHeartRateText(number: number | null) {
        const observationText = formatValue(number, null, {
          fractionalDigitCount: 0,
        })
        return new LocalizedText({
          en: `Average Heart Rate: ${observationText}`,
        }).localize(...languages)
      },
      currentBodyWeightText(
        observation: { value: number; unit: QuantityUnit } | null,
      ) {
        const observationText = formatValue(
          observation?.value ?? null,
          observation?.unit ?? null,
          { fractionalDigitCount: 0 },
        )
        return new LocalizedText({
          en: `Current Weight: ${observationText}`,
        }).localize(...languages)
      },
      averageBodyWeightText(
        observation: { value: number; unit: QuantityUnit } | null,
      ) {
        const observationText = formatValue(
          observation?.value ?? null,
          observation?.unit ?? null,
          { fractionalDigitCount: 0 },
        )
        return new LocalizedText({
          en: `Last Week Average Weight: ${observationText}`,
        }).localize(...languages)
      },
      dryWeightText(observation: { value: number; unit: QuantityUnit } | null) {
        const observationText = formatValue(
          observation?.value ?? null,
          observation?.unit ?? null,
          { fractionalDigitCount: 0 },
        )
        return new LocalizedText({
          en: `Prior Dry Weight: ${observationText}`,
        }).localize(...languages)
      },
    },
    symptomScoresSection: {
      title: new LocalizedText({
        en: 'SYMPTOM SURVEY [KCCQ-12] REPORT',
      }).localize(...languages),
      description: new LocalizedText({
        en: 'These symptom scores range from 0-100.\nA score of 0 indicates severe symptoms.\nA score of 100 indicates you are doing extremely well.',
      }).localize(...languages),
      personalSummary: {
        title: new LocalizedText({
          en: 'Personal Summary:',
        }).localize(...languages),
        above90Improving: new LocalizedText({
          en: 'Your heart symptoms score has increased. This means you are feeling better. Your score is overall very good. Continuing to take your meds will be important for keeping you feeling well.',
        }).localize(...languages),
        above90NotImproving: new LocalizedText({
          en: 'Your heart symptom score remains very good. Continuing to take your meds will be important for keeping you feeling well.',
        }).localize(...languages),
        below90Improving: new LocalizedText({
          en: 'Your heart symptoms score has increased. This means you have been feeling better. There is still room to continue improving how you feel. Getting on the best doses of heart failure medicines can help you feeling better. Consider discussing further with your care team.',
        }).localize(...languages),
        below90Stable: new LocalizedText({
          en: 'Your heart symptom score is stable. There is still room to continue improving how you feel. Getting on the best doses of heart failure medicines can help you feeling better. Consider discussing further with your care team.',
        }).localize(...languages),
        below90Worsening: new LocalizedText({
          en: 'Your heart symptoms score has decreased. This means you are feeling worse. Consider talking to your care team about adjusting your heart failure medications as these have been shown to improve symptoms long term.',
        }).localize(...languages),
      },
    },
    symptomScoresTable: {
      dateHeader: new LocalizedText({
        en: '',
      }).localize(...languages),
      overallScoreHeader: new LocalizedText({
        en: 'Overall Score',
      }).localize(...languages),
      physicalLimitsScoreHeader: new LocalizedText({
        en: 'Physical Limits',
      }).localize(...languages),
      socialLimitsScoreHeader: new LocalizedText({
        en: 'Social Limits',
      }).localize(...languages),
      qualityOfLifeScoreHeader: new LocalizedText({
        en: 'Quality of Life',
      }).localize(...languages),
      symptomFrequencyScoreHeader: new LocalizedText({
        en: 'Heart Failure Symptoms',
      }).localize(...languages),
      dizzinessScoreHeader: new LocalizedText({
        en: 'Dizziness',
      }).localize(...languages),
      formatDate(date: Date) {
        return formatDate(date)
      },
    },
    detailedVitalsSection: {
      title: new LocalizedText({
        en: 'DETAILS OF VITALS',
      }).localize(...languages),
      bodyWeightTitle: new LocalizedText({
        en: 'Weight',
      }).localize(...languages),
      bodyWeightTable: {
        titleHeader: new LocalizedText({
          en: '',
        }).localize(...languages),
        currentHeader: new LocalizedText({
          en: 'Current',
        }).localize(...languages),
        sevenDayAverageHeader: new LocalizedText({
          en: '7-Day Average',
        }).localize(...languages),
        lastVisitHeader: new LocalizedText({
          en: 'Last Visit',
        }).localize(...languages),
        rangeHeader: new LocalizedText({
          en: 'Range',
        }).localize(...languages),
        rowTitle: new LocalizedText({
          en: 'Weight',
        }).localize(...languages),
      },
      heartRateTitle: new LocalizedText({
        en: 'Heart Rate',
      }).localize(...languages),
      heartRateTable: {
        titleHeader: new LocalizedText({
          en: '',
        }).localize(...languages),
        medianHeader: new LocalizedText({
          en: 'Median',
        }).localize(...languages),
        iqrHeader: new LocalizedText({
          en: 'IQR',
        }).localize(...languages),
        percentageUnder50Header: new LocalizedText({
          en: '% Under 50',
        }).localize(...languages),
        percentageOver120Header: new LocalizedText({
          en: '% Over 120',
        }).localize(...languages),
        rowTitle: new LocalizedText({
          en: 'Heart Rate',
        }).localize(...languages),
      },
      systolicBloodPressureTitle: new LocalizedText({
        en: 'Systolic Blood Pressure',
      }).localize(...languages),
      diastolicBloodPressureTitle: new LocalizedText({
        en: 'Diastolic Blood Pressure',
      }).localize(...languages),
      bloodPressureTable: {
        titleHeader: new LocalizedText({
          en: '',
        }).localize(...languages),
        medianHeader: new LocalizedText({
          en: 'Median',
        }).localize(...languages),
        iqrHeader: new LocalizedText({
          en: 'IQR',
        }).localize(...languages),
        percentageUnder90Header: new LocalizedText({
          en: '% Under 90 mmHg',
        }).localize(...languages),
        percentageOver180Header: new LocalizedText({
          en: '% Over 180 mmHg',
        }).localize(...languages),
        systolicRowTitle: new LocalizedText({
          en: 'Systolic',
        }).localize(...languages),
        diastolicRowTitle: new LocalizedText({
          en: 'Diastolic',
        }).localize(...languages),
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

function formatValue(
  value: number | null,
  unit: QuantityUnit | null,
  options: { fractionalDigitCount: number } = {
    fractionalDigitCount: 0,
  },
): string {
  if (value === null) return '---'
  const valueString = value.toFixed(options.fractionalDigitCount)
  if (unit === null) return valueString
  return `${valueString} ${unit.unit}`
}
