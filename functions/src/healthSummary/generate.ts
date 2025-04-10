//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  percentage,
  presortedMedian,
  presortedPercentile,
  type Observation,
  UserMedicationRecommendationType,
} from '@stanfordbdhg/engagehf-models'
import { logger } from 'firebase-functions'
import 'jspdf-autotable' /* eslint-disable-line */
import { type CellDef } from 'jspdf-autotable' /* eslint-disable-line */
import { healthSummaryLocalization } from './generate+localizations.js'
import { generateChartSvg } from './generateChart.js'
import { generateSpeedometerSvg } from './generateSpeedometer.js'
import { healthSummaryKeyPointTexts } from './keyPointsMessage.js'
import { PdfGenerator } from './pdfGenerator.js'
import { type HealthSummaryData } from '../models/healthSummaryData.js'
import { Localizer } from '../services/localization/localizer.js'

export interface HealthSummaryOptions {
  languages: string[]
}

export function generateHealthSummary(
  data: HealthSummaryData,
  options: HealthSummaryOptions,
): Buffer {
  logger.debug(
    `generateHealthSummary: ${data.vitals.bodyWeight.length} body weight observations.`,
  )
  logger.debug(
    `generateHealthSummary: ${data.vitals.heartRate.length} heart rate observations.`,
  )
  logger.debug(
    `generateHealthSummary: ${data.vitals.systolicBloodPressure.length} systolic blood pressure observations.`,
  )
  logger.debug(
    `generateHealthSummary: ${data.vitals.diastolicBloodPressure.length} diastolic blood pressure observations.`,
  )
  logger.debug(
    `generateHealthSummary: ${data.vitals.dryWeight !== undefined ? 1 : 0} dry weight observations.`,
  )
  logger.debug(
    `generateHealthSummary: ${data.recommendations.length} recommendations.`,
  )
  logger.debug(
    `generateHealthSummary: ${data.symptomScores.length} symptom scores.`,
  )
  const generator = new HealthSummaryPdfGenerator(data, options)

  generator.addPageHeader()
  generator.addKeyPointsSection()
  generator.addCurrentMedicationSection()
  generator.addMedicationRecommendationsSection()
  generator.addSymptomScoresSummarySection()

  generator.newPage()
  generator.addSymptomScoresTableSection()
  generator.addVitalsSection()

  return generator.finish()
}

class HealthSummaryPdfGenerator extends PdfGenerator {
  // Properties

  data: HealthSummaryData
  options: HealthSummaryOptions

  localizer: Localizer<typeof healthSummaryLocalization>

  // Constructor

  constructor(data: HealthSummaryData, options: HealthSummaryOptions) {
    super()
    this.data = data
    this.options = options
    this.localizer = new Localizer(healthSummaryLocalization, options.languages)
  }

  // Methods

  addPageHeader() {
    this.addText(this.localizer.text('headerTitle'), this.textStyles.h2)
    this.addText(this.data.name ?? '---', this.textStyles.h1)
    this.addText(
      this.localizer.text(
        'headerDateOfBirth',
        this.data.dateOfBirth !== undefined ?
          this.formatDate(this.data.dateOfBirth)
        : '---',
      ),
    )
    this.addText(
      this.localizer.text('headerProvider', this.data.providerName ?? '---'),
    )
    const appointment = this.data.nextAppointment
    const date = appointment?.start
    const providerNames = appointment?.providerNames ?? []
    const providerText =
      providerNames.length === 0 ? '' : providerNames.join(', ') + ' '
    this.addText(
      date !== undefined ?
        this.localizer.text(
          'headerNextAppointment',
          providerText + this.formatDate(date),
          this.formatTime(date),
        )
      : this.localizer.text('headerNextAppointmentNone'),
    )

    const innerWidth = this.pageWidth - this.margins.left - this.margins.right
    const pageNumberText = this.localizer.text(
      'headerPageNumber',
      this.doc.getNumberOfPages().toFixed(0),
    )
    const pageNumberWidth = this.doc.getTextWidth(pageNumberText)
    this.cursor.x = this.margins.left + innerWidth - pageNumberWidth
    this.cursor.y -= this.textStyles.body.fontSize
    this.addText(pageNumberText, this.textStyles.body, pageNumberWidth)
    this.cursor.x = this.margins.left

    this.addLine(
      { x: this.cursor.x, y: this.cursor.y },
      { x: this.cursor.x + innerWidth, y: this.cursor.y },
      this.colors.black,
      1,
    )
    this.moveDown(this.textStyles.body.fontSize / 2)
  }

  addKeyPointsSection() {
    this.addSectionTitle(this.localizer.text('keyPointsTitle'))

    const recommendationsCategory = this.data.recommendationsCategory
    const texts =
      recommendationsCategory !== null ?
        (healthSummaryKeyPointTexts({
          recommendations: recommendationsCategory,
          symptomScore: this.data.symptomScoreCategory,
          dizziness: this.data.dizzinessCategory,
          weight: this.data.weightCategory,
        })?.map((key) => key.localize(...this.options.languages)) ?? null)
      : null
    if (texts !== null) {
      if (texts.length === 1) {
        this.addText(texts[0], this.textStyles.bodyColored)
      } else {
        this.addList(texts, this.textStyles.bodyColored)
      }
    } else {
      this.addText(
        this.localizer.text('keyPointsDefault'),
        this.textStyles.bodyItalic,
      )
    }
  }

  addCurrentMedicationSection() {
    const currentMedication = this.data.recommendations.filter(
      (recommendation) =>
        recommendation.displayInformation.dosageInformation.currentSchedule
          .length > 0,
    )
    if (currentMedication.length === 0) return
    this.addSectionTitle(this.localizer.text('currentMedicationsTitle'))
    this.addText(
      this.localizer.text('currentMedicationsDescription'),
      this.textStyles.bodyItalic,
    )

    const tableContent: CellDef[][] = [
      [
        this.localizer.text('currentMedicationsTableNameHeader'),
        this.localizer.text('currentMedicationsTableCurrentDoseHeader'),
        this.localizer.text('currentMedicationsTableTargetDoseHeader'),
      ].map((title) => this.cell(title, { fontStyle: 'bold' })),
      ...currentMedication.map((recommendation) => [
        this.cell(
          '[ ] ' +
            recommendation.displayInformation.title.localize(
              ...this.options.languages,
            ),
        ),
        this.cell(
          recommendation.displayInformation.dosageInformation.currentSchedule
            .map((schedule) =>
              this.medicationDoseScheduleText({
                schedule,
                unit: recommendation.displayInformation.dosageInformation.unit,
              }),
            )
            .join('\n'),
        ),
        this.cell(
          recommendation.displayInformation.dosageInformation.targetSchedule
            .map((schedule) =>
              this.medicationDoseScheduleText({
                schedule,
                unit: recommendation.displayInformation.dosageInformation.unit,
              }),
            )
            .join('\n'),
        ),
      ]),
    ]

    this.addTable(tableContent)
    this.moveDown(this.textStyles.body.fontSize)
  }

  addMedicationRecommendationsSection() {
    const optimizations = this.data.recommendations.filter((recommendation) =>
      [
        UserMedicationRecommendationType.improvementAvailable,
        UserMedicationRecommendationType.notStarted,
      ].includes(recommendation.displayInformation.type),
    )
    if (optimizations.length === 0) return
    this.addSectionTitle(this.localizer.text('medicationRecommendationsTitle'))

    this.addList(
      optimizations.map((recommendation) => {
        const title = recommendation.displayInformation.title.localize(
          ...this.options.languages,
        )
        const description =
          recommendation.displayInformation.description.localize(
            ...this.options.languages,
          )
        return `${title}: ${description}`
      }),
      this.textStyles.bodyColored,
    )

    this.moveDown(this.textStyles.body.fontSize / 2)
    this.addText(
      this.localizer.text('medicationRecommendationsDescription'),
      this.textStyles.bodyItalic,
    )
    this.addText(
      this.localizer.text('medicationRecommendationsHint'),
      this.textStyles.bodyColoredBoldItalic,
    )
  }

  addSymptomScoresSummarySection() {
    if (this.data.symptomScores.length === 0) return
    this.addSectionTitle(this.localizer.text('symptomScoresSummaryTitle'))

    this.splitTwoColumns(
      (columnWidth) => {
        this.addSpeedometer(columnWidth)
      },
      (columnWidth) => {
        this.addText(
          this.localizer.text('symptomScoresSummaryDescription'),
          this.textStyles.bodyItalic,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize / 2)

        const personalSummaryText = this.symptomScorePersonalSummaryText()
        if (personalSummaryText !== null) {
          this.addText(
            personalSummaryText,
            this.textStyles.bodyColored,
            columnWidth,
          )
        }
      },
    )
  }

  addSymptomScoresTableSection() {
    if (this.data.symptomScores.length === 0) return
    this.addSectionTitle(this.localizer.text('symptomScoresTableTitle'))
    this.addText(
      this.localizer.text('symptomScoresTableDescription'),
      this.textStyles.bodyItalic,
    )

    const tableContent: CellDef[][] = [
      [
        '',
        this.localizer.text('symptomScoresTableOverallScoreHeader'),
        this.localizer.text('symptomScoresTablePhysicalLimitsScoreHeader'),
        this.localizer.text('symptomScoresTableSocialLimitsScoreHeader'),
        this.localizer.text('symptomScoresTableQualityOfLifeScoreHeader'),
        this.localizer.text('symptomScoresTableSymptomFrequencyScoreHeader'),
        this.localizer.text('symptomScoresTableDizzinessScoreHeader'),
      ].map((title) => this.cell(title)),
      ...this.data.symptomScores.map((score, index) => [
        this.cell(this.formatDate(score.date), {
          fontStyle: index === 0 ? 'bold' : 'normal',
        }),
        this.cell(score.overallScore.toFixed(0), {
          fontStyle: index === 0 ? 'bold' : 'normal',
        }),
        this.cell(score.physicalLimitsScore?.toFixed(0) ?? '---', {
          fontStyle: index === 0 ? 'bold' : 'normal',
        }),
        this.cell(score.socialLimitsScore?.toFixed(0) ?? '---', {
          fontStyle: index === 0 ? 'bold' : 'normal',
        }),
        this.cell(score.qualityOfLifeScore?.toFixed(0) ?? '---', {
          fontStyle: index === 0 ? 'bold' : 'normal',
        }),
        this.cell(score.symptomFrequencyScore?.toFixed(0) ?? '---', {
          fontStyle: index === 0 ? 'bold' : 'normal',
        }),
        this.cell(score.dizzinessScore.toFixed(0), {
          fontStyle: index === 0 ? 'bold' : 'normal',
        }),
      ]),
    ]
    this.addTable(tableContent)
    this.moveDown(this.textStyles.body.fontSize)
  }

  addVitalsSection() {
    this.addSectionTitle(this.localizer.text('vitalsTitle'))
    this.addWeightAndHeartRateVitalsPart()
    this.addBloodPressureVitalsPart()
  }

  private addWeightAndHeartRateVitalsPart() {
    if (
      this.data.vitals.bodyWeight.length === 0 &&
      this.data.vitals.heartRate.length === 0
    )
      return
    this.splitTwoColumns(
      (columnWidth) => {
        if (this.data.vitals.bodyWeight.length === 0) return
        this.addText(
          this.localizer.text('vitalsBodyWeightTitle'),
          this.textStyles.bodyBold,
          columnWidth,
        )
        this.addChart(
          this.data.vitals.bodyWeight,
          columnWidth,
          this.data.vitals.dryWeight?.value,
        )
        const bodyWeightRange = this.data.bodyWeightRange
        this.addTable(
          [
            [
              '',
              this.localizer.text('vitalsBodyWeightTableCurrentHeader'),
              this.localizer.text('vitalsBodyWeightTableSevenDayMedianHeader'),
              this.localizer.text('vitalsBodyWeightTableRangeHeader'),
            ].map((title) => this.cell(title)),
            [
              this.localizer.text('vitalsBodyWeightTableRowTitle'),
              this.data.latestBodyWeight?.toFixed(0) ?? '---',
              this.data.lastSevenDayMedianBodyWeight?.toFixed(0) ?? '---',
              bodyWeightRange !== null ?
                `${bodyWeightRange[0].toFixed(0)}-${bodyWeightRange[1].toFixed(0)}`
              : '---',
            ].map((title) => this.cell(title)),
          ],
          columnWidth,
        )
      },
      (columnWidth) => {
        if (this.data.vitals.heartRate.length === 0) return
        this.addText(
          this.localizer.text('vitalsHeartRateTitle'),
          this.textStyles.bodyBold,
          columnWidth,
        )
        this.addChart(this.data.vitals.heartRate, columnWidth)
        const values = [
          ...this.data.vitals.heartRate.map((observation) => observation.value),
        ].sort((a, b) => a - b)
        const upperMedian = presortedPercentile(values, 0.75)
        const lowerMedian = presortedPercentile(values, 0.25)
        this.addTable(
          [
            [
              '',
              this.localizer.text('vitalsHeartRateTableMedianHeader'),
              this.localizer.text('vitalsHeartRateTableIqrHeader'),
              this.localizer.text(
                'vitalsHeartRateTablePercentageUnder50Header',
              ),
              this.localizer.text(
                'vitalsHeartRateTablePercentageOver120Header',
              ),
            ].map((title) => this.cell(title)),
            [
              this.localizer.text('vitalsHeartRateTableRowTitle'),
              presortedMedian(values)?.toFixed(0) ?? '---',
              upperMedian && lowerMedian ?
                `${lowerMedian.toFixed(0)}-${upperMedian.toFixed(0)}`
              : '---',
              percentage(values, (value) => value < 50)?.toFixed(0) ?? '---',
              percentage(values, (value) => value > 120)?.toFixed(0) ?? '---',
            ].map((title) => this.cell(title)),
          ],
          columnWidth,
        )
      },
    )
    this.moveDown(this.textStyles.body.fontSize * 2)
  }

  private addBloodPressureVitalsPart() {
    const hasSystolic = this.data.vitals.systolicBloodPressure.length > 0
    const hasDiastolic = this.data.vitals.diastolicBloodPressure.length > 0
    if (!hasSystolic && !hasDiastolic) return
    this.splitTwoColumns(
      (columnWidth) => {
        if (!hasSystolic) return
        this.addText(
          this.localizer.text('vitalsSystolicBloodPressureTitle'),
          this.textStyles.bodyBold,
          columnWidth,
        )
        this.addChart(this.data.vitals.systolicBloodPressure, columnWidth)
      },
      (columnWidth) => {
        if (!hasDiastolic) return
        this.addText(
          this.localizer.text('vitalsDiastolicBloodPressureTitle'),
          this.textStyles.bodyBold,
          columnWidth,
        )
        this.addChart(this.data.vitals.diastolicBloodPressure, columnWidth)
      },
    )

    const systolicValues = [
      ...this.data.vitals.systolicBloodPressure.map(
        (observation) => observation.value,
      ),
    ].sort((a, b) => a - b)
    const systolicUpperMedian = presortedPercentile(systolicValues, 0.75)
    const systolicLowerMedian = presortedPercentile(systolicValues, 0.25)

    const diastolicValues = [
      ...this.data.vitals.diastolicBloodPressure.map(
        (observation) => observation.value,
      ),
    ].sort((a, b) => a - b)
    const diastolicUpperMedian = presortedPercentile(diastolicValues, 0.75)
    const diastolicLowerMedian = presortedPercentile(diastolicValues, 0.25)

    this.addTable([
      [
        '',
        this.localizer.text('vitalsBloodPressureTableMedianHeader'),
        this.localizer.text('vitalsBloodPressureTableIqrHeader'),
        this.localizer.text('vitalsBloodPressureTablePercentageUnder90Header'),
        this.localizer.text('vitalsBloodPressureTablePercentageOver180Header'),
      ].map((title) => this.cell(title)),
      (hasSystolic ?
        [
          this.localizer.text('vitalsBloodPressureTableSystolicRowTitle'),
          presortedMedian(systolicValues)?.toFixed(0) ?? '---',
          systolicUpperMedian && systolicLowerMedian ?
            `${systolicLowerMedian.toFixed(0)}-${systolicUpperMedian.toFixed(0)}`
          : '---',
          percentage(systolicValues, (value) => value < 90)?.toFixed(0) ??
            '---',
          percentage(systolicValues, (value) => value > 180)?.toFixed(0) ??
            '---',
        ]
      : ['', '', '', '', '']
      ).map((title) => this.cell(title)),
      (hasDiastolic ?
        [
          this.localizer.text('vitalsBloodPressureTableDiastolicRowTitle'),
          presortedMedian(diastolicValues)?.toFixed(0) ?? '---',
          diastolicUpperMedian && diastolicLowerMedian ?
            `${diastolicLowerMedian.toFixed(0)}-${diastolicUpperMedian.toFixed(0)}`
          : '---',
          '-',
          '-',
        ]
      : ['', '', '', '', '']
      ).map((title) => this.cell(title)),
    ])
    this.moveDown(this.textStyles.body.fontSize)
  }

  // Helpers - PDF Generation

  private addChart(data: Observation[], maxWidth?: number, baseline?: number) {
    const width =
      maxWidth ?? this.pageWidth - this.cursor.x - this.margins.right
    const height = width * (9 / 16)
    const svg = generateChartSvg(
      data,
      { width: width, height: height },
      { top: 10, right: 20, bottom: 40, left: 20 },
      baseline,
    )
    this.addSvg(svg, width)
  }

  private addSpeedometer(maxWidth?: number) {
    const width =
      maxWidth ?? this.pageWidth - this.cursor.x - this.margins.right
    const svg = generateSpeedometerSvg(this.data.symptomScores, width, {
      localizer: this.localizer,
    })
    this.addSvg(svg, width)
  }

  // Helpers - Localization

  private medicationDoseScheduleText(input: {
    schedule: {
      quantity: number[]
      frequency: number
    }
    unit: string
  }): string {
    const prefix =
      input.schedule.quantity.map((quantity) => quantity.toString()).join('/') +
      ' ' +
      input.unit +
      ' '
    switch (input.schedule.frequency) {
      case 1:
        return this.localizer.text(
          'currentMedicationsTableDoseScheduleOnceDaily',
          prefix,
        )
      case 2:
        return this.localizer.text(
          'currentMedicationsTableDoseScheduleTwiceDaily',
          prefix,
        )
      default:
        return this.localizer.text(
          'currentMedicationsTableDoseScheduleMultipleTimesDaily',
          prefix,
          input.schedule.frequency.toString(),
        )
    }
  }

  private symptomScorePersonalSummaryText(): string | null {
    const currentScore = this.data.latestSymptomScore?.overallScore
    const previousScore = this.data.secondLatestSymptomScore?.overallScore
    if (currentScore === undefined || previousScore === undefined) return null
    const currentScoreText = currentScore.toFixed(0) + '%'
    const previousScoreText = previousScore.toFixed(0) + '%'
    const improvement = currentScore - previousScore

    if (currentScore >= 90) {
      if (improvement >= 10) {
        return this.localizer.text(
          'symptomScoresSummaryGoodImproving',
          previousScoreText,
          currentScoreText,
        )
      } else {
        return this.localizer.text('symptomScoresSummaryGoodStable')
      }
    } else {
      if (improvement >= 10) {
        return this.localizer.text(
          'symptomScoresSummaryFairImproving',
          previousScoreText,
          currentScoreText,
        )
      } else if (improvement > -10) {
        return this.localizer.text('symptomScoresSummaryFairStable')
      } else {
        return this.localizer.text(
          'symptomScoresSummaryFairWorsening',
          previousScoreText,
          currentScoreText,
        )
      }
    }
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}
