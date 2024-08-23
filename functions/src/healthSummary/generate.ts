//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import fs from 'fs'
import { Resvg, type ResvgRenderOptions } from '@resvg/resvg-js'
import {
  type Observation,
  UserMedicationRecommendationType,
} from '@stanfordbdhg/engagehf-models'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable' /* eslint-disable-line */
import {
  Styles,
  type CellDef,
  type RowInput,
  type UserOptions,
} from 'jspdf-autotable' /* eslint-disable-line */
import { healthSummaryLocalizations } from './generate+localizations.js'
import { generateChartSvg } from './generateChart.js'
import { generateSpeedometerSvg } from './generateSpeedometer.js'
import {
  average,
  percentage,
  presortedMedian,
  presortedPercentile,
} from '../extensions/array.js'
import { type HealthSummaryData } from '../models/healthSummaryData.js'

export interface HealthSummaryOptions {
  languages: string[]
}

export function generateHealthSummary(
  data: HealthSummaryData,
  options: HealthSummaryOptions,
): Buffer {
  const generator = new HealthSummaryPDFGenerator(data, options)
  generator.addFirstPage()
  generator.addSecondPage()
  return generator.finish()
}

enum FontStyle {
  normal = 'normal',
  bold = 'bold',
}

interface TextStyle {
  fontName: string
  fontStyle: FontStyle
  fontWeight?: string
  fontSize: number
  color?: [number, number, number]
}

class HealthSummaryPDFGenerator {
  // Properties

  data: HealthSummaryData
  options: HealthSummaryOptions

  doc: jsPDF
  pageWidth = 612
  pageHeight = 792
  margins = { top: 50, bottom: 50, left: 40, right: 40 }
  cursor = { x: this.margins.left, y: this.margins.top }

  colors = {
    black: [0, 0, 0] as [number, number, number],
    primary: [0, 117, 116] as [number, number, number],
    lightGray: [211, 211, 211] as [number, number, number],
  }

  texts: ReturnType<typeof healthSummaryLocalizations>

  fontName = 'Open Sans'
  textStyles = {
    h1: {
      fontName: this.fontName,
      fontStyle: FontStyle.bold,
      fontSize: 18,
    } as TextStyle,
    h2: {
      fontName: this.fontName,
      fontStyle: FontStyle.normal,
      fontSize: 16,
      color: this.colors.primary,
    } as TextStyle,
    h3: {
      fontName: this.fontName,
      fontStyle: FontStyle.normal,
      fontSize: 15,
    } as TextStyle,
    body: {
      fontName: this.fontName,
      fontStyle: FontStyle.normal,
      fontSize: 10,
    } as TextStyle,
    bodyColored: {
      fontName: this.fontName,
      fontStyle: FontStyle.normal,
      fontSize: 10,
      color: this.colors.primary,
    } as TextStyle,
    bodyColoredBold: {
      fontName: this.fontName,
      fontStyle: FontStyle.bold,
      fontSize: 10,
      color: this.colors.primary,
    } as TextStyle,
    bodyBold: {
      fontName: this.fontName,
      fontStyle: FontStyle.bold,
      fontSize: 10,
    } as TextStyle,
  }

  // Constructor

  constructor(data: HealthSummaryData, options: HealthSummaryOptions) {
    this.data = data
    this.options = options
    this.texts = healthSummaryLocalizations(options.languages)
    this.doc = new jsPDF('p', 'pt', [this.pageWidth, this.pageHeight], true)
    this.addFont(
      'resources/fonts/OpenSans-Regular.ttf',
      this.fontName,
      FontStyle.normal,
    )
    this.addFont(
      'resources/fonts/OpenSans-Bold.ttf',
      this.fontName,
      FontStyle.bold,
    )
  }

  // Methods

  addFirstPage() {
    this.addPageHeader()
    this.addMedicationSection()
    this.addVitalsSection()
    this.addSymptomScoresSection()
  }

  addSecondPage() {
    this.addPage()
    this.addVitalsChartsSection()
  }

  finish(): Buffer {
    return Buffer.from(this.doc.output('arraybuffer'))
  }

  // Helpers

  private addMedicationSection() {
    this.addSectionTitle(this.texts.medicationsSection.title)
    this.moveDown(4)

    this.splitTwoColumns(
      (columnWidth) => {
        this.addText(
          this.texts.medicationsSection.currentTitle,
          this.textStyles.bodyBold,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize + 4)
        this.addText(
          this.texts.medicationsSection.currentText,
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize)
      },
      (columnWidth) => {
        this.addText(
          this.texts.medicationsSection.recommendationsTitle,
          this.textStyles.bodyBold,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize + 4)
        this.addText(
          this.texts.medicationsSection.recommendationsText,
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        this.addText(
          this.texts.medicationsSection.recommendationsHint,
          this.textStyles.bodyColoredBold,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize)
      },
    )

    function colorForRecommendationType(
      category: UserMedicationRecommendationType,
    ): string | undefined {
      switch (category) {
        case UserMedicationRecommendationType.targetDoseReached:
          return 'rgb(0,255,0)'
        case UserMedicationRecommendationType.improvementAvailable:
          return 'rgb(255,255,0)'
        case UserMedicationRecommendationType.notStarted:
          return 'rgb(211,211,211)'
      }
    }

    const tableContent: CellDef[][] = [
      [
        this.texts.medicationsTable.nameHeader,
        this.texts.medicationsTable.doseHeader,
        this.texts.medicationsTable.targetDoseHeader,
        this.texts.medicationsTable.recommendationHeader,
        this.texts.medicationsTable.commentsHeader,
      ].map((title) => this.cell(title)),
      ...this.data.recommendations.map((recommendation, index) => [
        this.cell(
          '[ ] ' +
            recommendation.displayInformation.title.localize(
              ...this.options.languages,
            ),
        ),
        this.cell(
          recommendation.displayInformation.dosageInformation.currentSchedule
            .map((schedule) =>
              this.texts.medicationsTable.doseSchedule(
                schedule,
                recommendation.displayInformation.dosageInformation.unit,
              ),
            )
            .join('\n'),
        ),
        this.cell(
          recommendation.displayInformation.dosageInformation.targetSchedule
            .map((schedule) =>
              this.texts.medicationsTable.doseSchedule(
                schedule,
                recommendation.displayInformation.dosageInformation.unit,
              ),
            )
            .join('\n'),
          {
            fillColor: colorForRecommendationType(
              recommendation.displayInformation.type,
            ),
          },
        ),
        this.cell(
          recommendation.displayInformation.description.localize(
            ...this.options.languages,
          ),
        ),
        this.cell('', {
          lineWidth: {
            bottom: index === this.data.recommendations.length - 1 ? 0.5 : 0,
            top: index == 0 ? 0.5 : 0,
            left: 0.5,
            right: 0.5,
          },
        }),
      ]),
    ]

    this.addTable(tableContent)
    this.moveDown(this.textStyles.body.fontSize)
  }

  private addVitalsSection() {
    this.addSectionTitle(this.texts.vitalsSection.title)
    this.moveDown(4)
    this.splitTwoColumns(
      (columnWidth) => {
        const avgSystolic = average(
          this.data.vitals.systolicBloodPressure.map(
            (observation) => observation.value,
          ),
        )
        this.addText(
          this.texts.vitalsSection.averageSystolicText(avgSystolic ?? null),
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        const avgDiastolic = average(
          this.data.vitals.diastolicBloodPressure.map(
            (observation) => observation.value,
          ),
        )
        this.addText(
          this.texts.vitalsSection.averageDiastolicText(avgDiastolic ?? null),
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        const avgHeartRate = average(
          this.data.vitals.heartRate.map((observation) => observation.value),
        )
        this.addText(
          this.texts.vitalsSection.averageHeartRateText(avgHeartRate ?? null),
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize)
      },
      (columnWidth) => {
        const currentWeight = this.data.vitals.bodyWeight.at(0)
        this.addText(
          this.texts.vitalsSection.currentBodyWeightText(currentWeight ?? null),
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        const avgWeight = average(
          this.data.vitals.bodyWeight.map((observation) => observation.value),
        )
        this.addText(
          this.texts.vitalsSection.averageBodyWeightText(
            avgWeight !== undefined && currentWeight !== undefined ?
              { value: avgWeight, unit: currentWeight.unit }
            : null,
          ),
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        this.addText(
          this.texts.vitalsSection.dryWeightText(
            this.data.vitals.dryWeight ?? null,
          ),
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize)
      },
    )
  }

  private addSymptomScoresSection() {
    this.addSectionTitle(this.texts.symptomScoresSection.title)
    this.moveDown(4)

    this.splitTwoColumns(
      (columnWidth) => {
        this.addSpeedometer(columnWidth)
      },
      (columnWidth) => {
        this.moveDown(this.textStyles.body.fontSize)
        this.texts.symptomScoresSection.description
          .split('\n')
          .forEach((line) => {
            this.addText(line, this.textStyles.body, columnWidth)
            this.moveDown(4)
          })

        const currentScore = this.data.symptomScores.at(0)
        const previousScore = this.data.symptomScores.at(1)
        if (
          this.data.symptomScores.length >= 2 &&
          currentScore !== undefined &&
          previousScore !== undefined
        ) {
          let personalSummaryText =
            this.texts.symptomScoresSection.personalSummary.title + ' '

          if (currentScore.overallScore >= 90) {
            if (currentScore.overallScore - previousScore.overallScore >= 10) {
              personalSummaryText +=
                this.texts.symptomScoresSection.personalSummary.above90Improving
            } else {
              personalSummaryText =
                this.texts.symptomScoresSection.personalSummary
                  .above90NotImproving
            }
          } else {
            const improvement =
              currentScore.overallScore - previousScore.overallScore
            if (improvement >= 10) {
              personalSummaryText +=
                this.texts.symptomScoresSection.personalSummary.below90Improving
            } else if (improvement > -10) {
              personalSummaryText +=
                this.texts.symptomScoresSection.personalSummary.below90Stable
            } else {
              personalSummaryText +=
                this.texts.symptomScoresSection.personalSummary.below90Worsening
            }
          }

          this.addText(
            personalSummaryText,
            this.textStyles.bodyColored,
            columnWidth,
          )
          this.moveDown(this.textStyles.body.fontSize)
        }
      },
    )

    const tableContent: CellDef[][] = [
      [
        this.texts.symptomScoresTable.dateHeader,
        this.texts.symptomScoresTable.overallScoreHeader,
        this.texts.symptomScoresTable.physicalLimitsScoreHeader,
        this.texts.symptomScoresTable.socialLimitsScoreHeader,
        this.texts.symptomScoresTable.qualityOfLifeScoreHeader,
        this.texts.symptomScoresTable.symptomFrequencyScoreHeader,
        this.texts.symptomScoresTable.dizzinessScoreHeader,
      ].map((title) => this.cell(title)),
      ...[...this.data.symptomScores].reverse().map((score, index) => [
        this.cell(this.texts.symptomScoresTable.formatDate(score.date), {
          fontStyle:
            index == this.data.symptomScores.length - 1 ? 'bold' : 'normal',
        }),
        this.cell(score.overallScore.toFixed(0)),
        this.cell(score.physicalLimitsScore?.toFixed(0) ?? '---'),
        this.cell(score.socialLimitsScore?.toFixed(0) ?? '---'),
        this.cell(score.qualityOfLifeScore?.toFixed(0) ?? '---'),
        this.cell(score.symptomFrequencyScore?.toFixed(0) ?? '---'),
        this.cell(score.dizzinessScore.toFixed(0)),
      ]),
    ]
    this.addTable(tableContent)
    this.moveDown(this.textStyles.body.fontSize)
  }

  private addVitalsChartsSection() {
    this.addSectionTitle(this.texts.detailedVitalsSection.title)

    this.splitTwoColumns(
      (columnWidth) => {
        this.addText(
          this.texts.detailedVitalsSection.bodyWeightTitle,
          this.textStyles.bodyBold,
          columnWidth,
        )
        this.addChart(
          this.data.vitals.bodyWeight,
          columnWidth,
          this.data.vitals.dryWeight?.value,
        )
        const bodyWeightValues = this.data.vitals.bodyWeight.map(
          (observation) => observation.value,
        )
        const avgWeight = average(bodyWeightValues)
        const maxWeight = Math.max(...bodyWeightValues)
        const minWeight = Math.min(...bodyWeightValues)

        this.addTable(
          [
            [
              this.texts.detailedVitalsSection.bodyWeightTable.titleHeader,
              this.texts.detailedVitalsSection.bodyWeightTable.currentHeader,
              this.texts.detailedVitalsSection.bodyWeightTable
                .sevenDayAverageHeader,
              this.texts.detailedVitalsSection.bodyWeightTable.lastVisitHeader,
              this.texts.detailedVitalsSection.bodyWeightTable.rangeHeader,
            ].map((title) => this.cell(title)),
            [
              this.texts.detailedVitalsSection.bodyWeightTable.rowTitle,
              this.data.vitals.bodyWeight.at(0)?.value.toFixed(0) ?? '---',
              avgWeight?.toFixed(0) ?? '---',
              '-',
              isFinite(maxWeight) && isFinite(minWeight) ?
                (maxWeight - minWeight).toFixed(0)
              : '---',
            ].map((title) => this.cell(title)),
          ],
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize * 2)
      },
      (columnWidth) => {
        this.addText(
          this.texts.detailedVitalsSection.heartRateTitle,
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
              this.texts.detailedVitalsSection.heartRateTable.titleHeader,
              this.texts.detailedVitalsSection.heartRateTable.medianHeader,
              this.texts.detailedVitalsSection.heartRateTable.iqrHeader,
              this.texts.detailedVitalsSection.heartRateTable
                .percentageUnder50Header,
              this.texts.detailedVitalsSection.heartRateTable
                .percentageOver120Header,
            ].map((title) => this.cell(title)),
            [
              this.texts.detailedVitalsSection.heartRateTable.rowTitle,
              presortedMedian(values)?.toFixed(0) ?? '---',
              upperMedian && lowerMedian ?
                (upperMedian - lowerMedian).toFixed(0)
              : '---',
              percentage(values, (value) => value < 50)?.toFixed(0) ?? '---',
              percentage(values, (value) => value > 120)?.toFixed(0) ?? '---',
            ].map((title) => this.cell(title)),
          ],
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize * 2)
      },
    )

    this.splitTwoColumns(
      (columnWidth) => {
        this.addText(
          this.texts.detailedVitalsSection.systolicBloodPressureTitle,
          this.textStyles.bodyBold,
          columnWidth,
        )
        this.addChart(this.data.vitals.systolicBloodPressure, columnWidth)
      },
      (columnWidth) => {
        this.addText(
          this.texts.detailedVitalsSection.diastolicBloodPressureTitle,
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
        this.texts.detailedVitalsSection.bloodPressureTable.titleHeader,
        this.texts.detailedVitalsSection.bloodPressureTable.medianHeader,
        this.texts.detailedVitalsSection.bloodPressureTable.iqrHeader,
        this.texts.detailedVitalsSection.bloodPressureTable
          .percentageUnder90Header,
        this.texts.detailedVitalsSection.bloodPressureTable
          .percentageOver180Header,
      ].map((title) => this.cell(title)),
      [
        this.texts.detailedVitalsSection.bloodPressureTable.systolicRowTitle,
        presortedMedian(systolicValues)?.toFixed(0) ?? '---',
        systolicUpperMedian && systolicLowerMedian ?
          (systolicUpperMedian - systolicLowerMedian).toFixed(0)
        : '---',
        percentage(systolicValues, (value) => value < 90)?.toFixed(0) ?? '---',
        percentage(systolicValues, (value) => value > 180)?.toFixed(0) ?? '---',
      ].map((title) => this.cell(title)),
      [
        this.texts.detailedVitalsSection.bloodPressureTable.diastolicRowTitle,
        presortedMedian(diastolicValues)?.toFixed(0) ?? '---',
        diastolicUpperMedian && diastolicLowerMedian ?
          (diastolicUpperMedian - diastolicLowerMedian).toFixed(0)
        : '---',
        '-',
        '-',
      ].map((title) => this.cell(title)),
    ])
    this.moveDown(this.textStyles.body.fontSize * 2)
  }

  private addPage() {
    this.doc.addPage([this.pageWidth, this.pageHeight])
    this.cursor = { x: this.margins.left, y: this.margins.top }
    this.addPageHeader()
  }

  private addPageHeader() {
    this.addText(this.texts.header.title, this.textStyles.h2)
    this.moveDown(4)
    this.addText(this.data.name ?? '---', this.textStyles.h1)
    this.moveDown(4)
    this.addText(
      this.texts.header.dateOfBirthLine(this.data.dateOfBirth ?? null),
    )
    this.moveDown(4)
    this.addText(
      this.texts.header.clinicianLine(this.data.clinicianName ?? null),
    )
    this.moveDown(4)
    this.addText(
      this.texts.header.nextAppointmentLine(this.data.nextAppointment ?? null),
    )

    const innerWidth = this.pageWidth - this.margins.left - this.margins.right
    const pageNumberText = this.texts.header.pageNumberTitle(
      this.doc.getNumberOfPages(),
    )
    const pageNumberWidth = this.doc.getTextWidth(pageNumberText)
    this.cursor.x = this.margins.left + innerWidth - pageNumberWidth
    this.cursor.y -= this.textStyles.body.fontSize
    this.addText(pageNumberText, this.textStyles.body, pageNumberWidth)
    this.cursor.x = this.margins.left

    this.moveDown(8)
    this.addLine(
      { x: this.cursor.x, y: this.cursor.y },
      { x: this.cursor.x + innerWidth, y: this.cursor.y },
      this.colors.black,
      1,
    )
    this.moveDown(8)
  }

  private addSectionTitle(title: string) {
    this.moveDown(8)
    this.addText(title, this.textStyles.h3)
    this.moveDown(4)
  }

  private addChart(data: Observation[], maxWidth?: number, baseline?: number) {
    const width =
      maxWidth ?? this.pageWidth - this.cursor.x - this.margins.right
    const height = width * 0.75
    const svg = generateChartSvg(
      data,
      { width: width, height: height },
      { top: 20, right: 40, bottom: 40, left: 40 },
      baseline,
    )
    const img = this.convertSvgToPng(svg)
    this.addPNG(img, width)
  }

  private addSpeedometer(maxWidth?: number) {
    const width =
      maxWidth ?? this.pageWidth - this.cursor.x - this.margins.right
    const svg = generateSpeedometerSvg(this.data.symptomScores, width, {
      languages: this.options.languages,
    })
    const img = this.convertSvgToPng(svg)
    this.addPNG(img, width)
  }

  private convertSvgToPng(svg: string): Buffer {
    const options: ResvgRenderOptions = {
      font: {
        loadSystemFonts: false,
        fontDirs: ['resources/fonts'],
        defaultFontFamily: this.fontName,
        serifFamily: this.fontName,
        sansSerifFamily: this.fontName,
        cursiveFamily: this.fontName,
        fantasyFamily: this.fontName,
        monospaceFamily: this.fontName,
      },
      shapeRendering: 2,
      textRendering: 1,
      imageRendering: 0,
      fitTo: { mode: 'zoom', value: 3 },
    }
    return new Resvg(svg, options).render().asPng()
  }

  private addPNG(data: Buffer, maxWidth?: number) {
    const width =
      maxWidth ?? this.pageWidth - this.margins.left - this.margins.right
    const imgData = 'data:image/png;base64,' + data.toString('base64')
    const imgProperties = this.doc.getImageProperties(imgData)
    const height = width / (imgProperties.width / imgProperties.height)
    this.doc.addImage(
      imgData,
      this.cursor.x,
      this.cursor.y,
      width,
      height,
      undefined,
      'FAST',
    )
    this.moveDown(height)
  }

  private addTable(rows: CellDef[][], maxWidth?: number) {
    const textStyle = this.textStyles.body
    const options: UserOptions = {
      margin: { left: this.cursor.x },
      theme: 'grid',
      startY: this.cursor.y,
      tableWidth:
        maxWidth ?? this.pageWidth - this.margins.left - this.margins.right,
      body: rows,
      styles: {
        font: textStyle.fontName,
        fontStyle: textStyle.fontStyle,
        fontSize: textStyle.fontSize,
      },
    }
    ;(this.doc as any).autoTable(options) // eslint-disable-line
    this.cursor.y = (this.doc as any).lastAutoTable.finalY // eslint-disable-line
  }

  private addText(
    text: string,
    textStyle: TextStyle = this.textStyles.body,
    maxWidth?: number,
  ) {
    this.doc.setFont(
      textStyle.fontName,
      textStyle.fontStyle,
      textStyle.fontWeight,
    )
    this.doc.setFontSize(textStyle.fontSize)
    const previousTextColor = this.doc.getTextColor()
    if (textStyle.color) {
      this.doc.setTextColor(...textStyle.color)
    }
    const textWidth =
      maxWidth ?? this.pageWidth - this.cursor.x - this.margins.right
    const splitText = this.doc.splitTextToSize(text, textWidth) as string[]
    for (const textSegment of splitText) {
      this.doc.text(
        textSegment,
        this.cursor.x,
        this.cursor.y + textStyle.fontSize / 2,
      )
      this.cursor.y += textStyle.fontSize
    }
    if (textStyle.color) {
      this.doc.setTextColor(previousTextColor)
    }
  }

  private addLine(
    start: { x: number; y: number },
    end: { x: number; y: number },
    color: [number, number, number],
    width: number,
  ) {
    this.doc.setLineWidth(width)
    this.doc.setDrawColor(color[0], color[1], color[2])
    this.doc.line(start.x, start.y, end.x, end.y)
  }

  private splitTwoColumns(
    firstColumn: (width: number) => void,
    secondColumn: (width: number) => void,
  ) {
    const cursorBeforeSplit = structuredClone(this.cursor)
    const splitMargin = 8
    const innerWidth = this.pageWidth - this.margins.left - this.margins.right
    const columnWidth = innerWidth / 2 - splitMargin
    firstColumn(columnWidth)
    const firstColumnMaxY = this.cursor.y
    this.cursor = structuredClone(cursorBeforeSplit)
    this.cursor.x += columnWidth + splitMargin
    secondColumn(columnWidth)
    this.cursor = {
      x: cursorBeforeSplit.x,
      y: Math.max(firstColumnMaxY, this.cursor.y),
    }
  }

  private moveDown(deltaY: number) {
    this.cursor.y += deltaY
  }

  private addFont(file: string, name: string, style: FontStyle) {
    const fontFileContent = fs.readFileSync(file).toString('base64')
    const fileName = file.split('/').at(-1) ?? file
    this.doc.addFileToVFS(fileName, fontFileContent)
    this.doc.addFont(fileName, name, style.toString())
  }

  private cell(title: string, styles: Partial<Styles> = {}): CellDef {
    styles.cellPadding = styles.cellPadding ?? { vertical: 0, horizontal: 0 }
    styles.cellPadding = styles.fontSize ?? 4
    styles.lineWidth = styles.lineWidth ?? {
      top: 0.5,
      bottom: 0.5,
      left: 0.5,
      right: 0.5,
    }
    styles.textColor = styles.textColor ?? 'black'
    styles.lineColor = styles.lineColor ?? this.colors.black
    return {
      styles: styles,
      title: title,
    }
  }
}
