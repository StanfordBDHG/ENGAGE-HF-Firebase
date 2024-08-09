//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import fs from 'fs'
import { Resvg, type ResvgRenderOptions } from '@resvg/resvg-js'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable' /* eslint-disable-line */
import {
  type CellDef,
  type RowInput,
  type UserOptions,
} from 'jspdf-autotable' /* eslint-disable-line */
import { generateChartSvg } from './generateChart.js'
import { generateSpeedometerSvg } from './generateSpeedometer.js'
import {
  average,
  percentage,
  presortedMedian,
  presortedPercentile,
} from '../extensions/array.js'
import { localize } from '../extensions/localizedText.js'
import { type HealthSummaryData } from '../models/healthSummaryData.js'
import { type LocalizedText } from '../models/helpers.js'
import {
  type MedicationRecommendationDoseSchedule,
  MedicationRecommendationType,
} from '../models/medicationRecommendation.js'
import { type Observation } from '../models/vitals.js'

export interface HealthSummaryOptions {
  language: string
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

  constructor(data: HealthSummaryData, options: HealthSummaryOptions) {
    this.data = data
    this.options = options

    this.doc = new jsPDF('p', 'pt', [this.pageWidth, this.pageHeight])
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

  addFirstPage() {
    this.addPageHeader()
    this.addMedicationSection()
    this.addVitalsSection()
    this.addSymptomsSurveySection()
  }

  addSecondPage() {
    this.addPage()
    this.addVitalsChartsSection()
  }

  finish(): Buffer {
    return Buffer.from(this.doc.output('arraybuffer'))
  }

  addMedicationSection() {
    this.addSectionTitle('MEDICATIONS')
    this.moveDown(4)

    this.splitTwoColumns(
      (columnWidth) => {
        this.addText(
          'Current Medications',
          this.textStyles.bodyBold,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize + 4)
        this.addText(
          'Before your next clinic appointment, check off which medications you have been taking below:',
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize)
      },
      (columnWidth) => {
        this.addText(
          'Potential Positive Changes',
          this.textStyles.bodyBold,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize + 4)
        this.addText(
          'Please discuss optimizing these medications with your care them at your next clinic appointment.',
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        this.addText(
          'Aim to make one positive change!',
          this.textStyles.bodyColoredBold,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize)
      },
    )

    function colorForRecommendationType(
      category: MedicationRecommendationType,
    ): string | undefined {
      switch (category) {
        case MedicationRecommendationType.targetDoseReached:
          return 'rgb(0,255,0)'
        case MedicationRecommendationType.improvementAvailable:
          return 'rgb(255,255,0)'
        case MedicationRecommendationType.notStarted:
          return 'rgb(211,211,211)'
      }
    }

    const tableContent: CellDef[][] = [
      [
        {
          title: 'My medications',
        },
        {
          title: 'Dose',
        },
        {
          title: 'Target dose',
        },
        {
          title: 'Potential Positive Change',
        },
        {
          title: 'Questions/Comments',
        },
      ],
      ...this.data.recommendations.map((recommendation, index) => [
        {
          title:
            '[ ] ' + this.localize(recommendation.displayInformation.title),
        },
        {
          styles: {
            fillColor: colorForRecommendationType(
              recommendation.displayInformation.type,
            ),
          },
          title:
            recommendation.displayInformation.dosageInformation.currentSchedule
              .map((schedule) =>
                this.formatDoseSchedule(
                  schedule,
                  recommendation.displayInformation.dosageInformation.unit,
                ),
              )
              .join('\n'),
        },
        {
          styles: {
            fillColor: colorForRecommendationType(
              recommendation.displayInformation.type,
            ),
          },
          title:
            recommendation.displayInformation.dosageInformation.targetSchedule
              .map((schedule) =>
                this.formatDoseSchedule(
                  schedule,
                  recommendation.displayInformation.dosageInformation.unit,
                ),
              )
              .join('\n'),
        },
        {
          title: this.localize(recommendation.displayInformation.description),
        },
        {
          styles: {
            lineWidth: {
              bottom: index === this.data.recommendations.length - 1 ? 0.5 : 0,
              top: 0,
              left: 0.5,
              right: 0.5,
            },
          },
          title: '',
        },
      ]),
    ]

    this.addTable(tableContent)
    this.moveDown(this.textStyles.body.fontSize)
  }

  addVitalsSection() {
    this.addSectionTitle('VITALS OVER LAST 2 WEEKS')
    this.moveDown(4)
    this.splitTwoColumns(
      (columnWidth) => {
        const avgSystolic = average(
          this.data.vitals.systolicBloodPressure.map(
            (observation) => observation.value,
          ),
        )
        this.addText(
          `Average Systolic Blood Pressure: ${avgSystolic?.toFixed(0) ?? '---'}`,
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
          `Average Diastolic Blood Pressure: ${avgDiastolic?.toFixed(0) ?? '---'}`,
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        const avgHeartRate = average(
          this.data.vitals.heartRate.map((observation) => observation.value),
        )
        this.addText(
          `Average Heart Rate: ${avgHeartRate?.toFixed(0) ?? '---'}`,
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize)
      },
      (columnWidth) => {
        const currentWeight = this.data.vitals.bodyWeight.at(0)
        const weightUnit = currentWeight?.unit.unit ?? ''
        this.addText(
          `Current Weight: ${currentWeight?.value.toFixed(0) ?? '---'} ${weightUnit}`,
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        const avgWeight = average(
          this.data.vitals.bodyWeight.map((observation) => observation.value),
        )
        this.addText(
          `Last Week Average Weight: ${avgWeight?.toFixed(0) ?? '---'} ${weightUnit}`,
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        this.addText(
          `Prior Dry Weight: ${this.data.vitals.dryWeight?.value.toFixed(0) ?? '---'} ${weightUnit}`,
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize)
      },
    )
  }

  addSymptomsSurveySection() {
    this.addSectionTitle('SYMPTOM SURVEY [KCCQ-12] REPORT')
    this.moveDown(4)

    this.splitTwoColumns(
      (columnWidth) => {
        this.addSpeedometer(columnWidth)
      },
      (columnWidth) => {
        this.moveDown(this.textStyles.body.fontSize)
        this.addText(
          'These symptom scores range from 0-100.',
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        this.addText(
          'A score of 0 indicates severe symptoms.',
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        this.addText(
          'A score of 100 indicates you are doing extremely well.',
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize)
        this.addText(
          'Personal Summary: Your symptom scores have decreased. This means you are feeling worse. This is helpful to document to make sure you are on the right medical therapy.',
          this.textStyles.bodyColored,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize)
      },
    )

    const tableContent: CellDef[][] = [
      [
        {
          title: ' ',
        },
        {
          title: 'Overall Score',
        },
        {
          title: 'Physical Limits',
        },
        {
          title: 'Social Limits',
        },
        {
          title: 'Quality of Life',
        },
        {
          title: 'Heart Failure Symptoms',
        },
        {
          title: 'Dizziness',
        },
      ],
      ...this.data.symptomScores.map((score, index) => [
        {
          title: this.formatDate(score.date),
          styles: {
            fontStyle:
              index == this.data.symptomScores.length - 1 ? 'bold' : 'normal',
          },
        } as CellDef,
        {
          title: String(score.overallScore),
        },
        {
          title:
            score.physicalLimitsScore ?
              String(score.physicalLimitsScore)
            : '---',
        },
        {
          title:
            score.socialLimitsScore ? String(score.socialLimitsScore) : '---',
        },
        {
          title:
            score.qualityOfLifeScore ? String(score.qualityOfLifeScore) : '---',
        },
        {
          title:
            score.symptomFrequencyScore ?
              String(score.symptomFrequencyScore)
            : '---',
        },
        {
          title: String(score.dizzinessScore),
        },
      ]),
    ]
    this.addTable(tableContent)
    this.moveDown(this.textStyles.body.fontSize)
  }

  addVitalsChartsSection() {
    this.addSectionTitle('DETAILS OF VITALS')

    this.splitTwoColumns(
      (columnWidth) => {
        this.addText('Weight', this.textStyles.bodyBold, columnWidth)
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
            [' ', 'Current', '7-Day Average', 'Last Visit', 'Range'],
            [
              'Weight',
              this.data.vitals.bodyWeight.at(0)?.value.toFixed(0) ?? '---',
              avgWeight?.toFixed(0) ?? '---',
              '-',
              isFinite(maxWeight) && isFinite(minWeight) ?
                (maxWeight - minWeight).toFixed(0)
              : '---',
            ],
          ],
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize * 2)
      },
      (columnWidth) => {
        this.addText('Heart Rate', this.textStyles.bodyBold, columnWidth)
        this.addChart(this.data.vitals.heartRate, columnWidth)
        const values = [
          ...this.data.vitals.heartRate.map((observation) => observation.value),
        ].sort((a, b) => a - b)
        const upperMedian = presortedPercentile(values, 0.75)
        const lowerMedian = presortedPercentile(values, 0.25)
        this.addTable(
          [
            [' ', 'Median', 'IQR', '% Under 50', '% Over 120'],
            [
              'Heart Rate',
              presortedMedian(values)?.toFixed(0) ?? '---',
              upperMedian && lowerMedian ?
                (upperMedian - lowerMedian).toFixed(0)
              : '---',
              percentage(values, (value) => value < 50)?.toFixed(0) ?? '---',
              percentage(values, (value) => value > 120)?.toFixed(0) ?? '---',
            ],
          ],
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize * 2)
      },
    )

    this.splitTwoColumns(
      (columnWidth) => {
        this.addText(
          'Systolic Blood Pressure',
          this.textStyles.bodyBold,
          columnWidth,
        )
        this.addChart(this.data.vitals.systolicBloodPressure, columnWidth)
      },
      (columnWidth) => {
        this.addText(
          'Diastolic Blood Pressure',
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
      [' ', 'Median', 'IQR', '% Under 90 mmHg', '% Over 180 mmHg'],
      [
        'Systolic',
        presortedMedian(systolicValues)?.toFixed(0) ?? '---',
        systolicUpperMedian && systolicLowerMedian ?
          (systolicUpperMedian - systolicLowerMedian).toFixed(0)
        : '---',
        percentage(systolicValues, (value) => value < 90)?.toFixed(0) ?? '---',
        percentage(systolicValues, (value) => value > 180)?.toFixed(0) ?? '---',
      ],
      [
        'Diastolic',
        presortedMedian(diastolicValues)?.toFixed(0) ?? '---',
        diastolicUpperMedian && diastolicLowerMedian ?
          (diastolicUpperMedian - diastolicLowerMedian).toFixed(0)
        : '---',
        '-',
        '-',
      ],
    ])
    this.moveDown(this.textStyles.body.fontSize * 2)
  }

  addPage() {
    this.doc.addPage([this.pageWidth, this.pageHeight])
    this.cursor = { x: this.margins.left, y: this.margins.top }
    this.addPageHeader()
  }

  addPageHeader() {
    this.addText('ENGAGE-HF Mobile App Health Summary', this.textStyles.h2)
    this.moveDown(4)
    this.addText(this.data.name, this.textStyles.h1)
    this.moveDown(4)
    this.addText(
      `DOB: ${this.data.dateOfBirth ? this.formatDate(this.data.dateOfBirth) : '---'}`,
    )
    this.moveDown(4)
    this.addText(`Provider: ${this.data.clinicianName}`)
    this.moveDown(4)
    this.addText(
      `Next Appointment: ${this.data.nextAppointment ? this.formatDate(this.data.nextAppointment) : '---'}`,
    )

    const innerWidth = this.pageWidth - this.margins.left - this.margins.right
    const pageNumberText = `Page ${this.doc.getNumberOfPages()}`
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

  addSectionTitle(title: string) {
    this.moveDown(8)
    this.addText(title, this.textStyles.h3)
    this.moveDown(4)
  }

  addChart(data: Observation[], maxWidth?: number, baseline?: number) {
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

  addSpeedometer(maxWidth?: number) {
    const width =
      maxWidth ?? this.pageWidth - this.cursor.x - this.margins.right
    const svg = generateSpeedometerSvg(this.data.symptomScores, width)
    const img = this.convertSvgToPng(svg)
    this.addPNG(img, width)
  }

  convertSvgToPng(svg: string): Buffer {
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
      fitTo: { mode: 'zoom', value: 5 },
    }
    return new Resvg(svg, options).render().asPng()
  }

  addPNG(data: Buffer, maxWidth?: number) {
    const width =
      maxWidth ?? this.pageWidth - this.margins.left - this.margins.right
    const imgData = 'data:image/png;base64,' + data.toString('base64')
    const imgProperties = this.doc.getImageProperties(imgData)
    const height = width / (imgProperties.width / imgProperties.height)
    this.doc.addImage(imgData, this.cursor.x, this.cursor.y, width, height)
    this.moveDown(height)
  }

  addTable(rows: RowInput[], maxWidth?: number) {
    const textStyle = this.textStyles.body
    const options: UserOptions = {
      margin: { left: this.cursor.x },
      theme: 'grid',
      startY: this.cursor.y,
      tableWidth: maxWidth ?? 'auto',
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

  addText(
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

  addLine(
    start: { x: number; y: number },
    end: { x: number; y: number },
    color: [number, number, number],
    width: number,
  ) {
    this.doc.setLineWidth(width)
    this.doc.setDrawColor(color[0], color[1], color[2])
    this.doc.line(start.x, start.y, end.x, end.y)
  }

  splitTwoColumns(
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

  moveDown(deltaY: number) {
    this.cursor.y += deltaY
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  addFont(file: string, name: string, style: FontStyle) {
    const fontFileContent = fs.readFileSync(file).toString('base64')
    const fileName = file.split('/').at(-1) ?? file
    this.doc.addFileToVFS(fileName, fontFileContent)
    this.doc.addFont(fileName, name, style.toString())
  }

  formatDoseSchedule(
    schedule: MedicationRecommendationDoseSchedule,
    unit: string,
  ): string {
    const prefix =
      schedule.quantity.map((quantity) => quantity.toString()).join('/') +
      ' ' +
      unit +
      ' '
    switch (schedule.frequency) {
      case 1:
        return prefix + 'daily'
      case 2:
        return prefix + 'twice daily'
      default:
        return prefix + `${schedule.frequency}x daily`
    }
  }

  localize(text: LocalizedText): string {
    return localize(text, this.options.language)
  }
}
