import fs from 'fs'
import { Resvg, type ResvgRenderOptions } from '@resvg/resvg-js'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable' /* eslint-disable-line */
import { type CellDef, type RowInput, type UserOptions } from 'jspdf-autotable' /* eslint-disable-line */
import { generateChartSvg } from './generateChart.js'
import { generateSpeedometerSvg } from './generateSpeedometer.js'
import { type HealthSummaryData } from './healthSummaryData.js'
import { MedicationOptimizationCategory } from './medication.js'
import { type Observation } from './vitals.js'

export function generateHealthSummary(data: HealthSummaryData): Buffer {
  const generator = new HealthSummaryPDFGenerator(data)
  generator.addFirstPage()
  generator.addSecondPage()
  return generator.finish()
}

interface TextStyle {
  fontName: string
  fontStyle: string
  fontWeight?: string
  fontSize: number
  color?: [number, number, number]
}

class HealthSummaryPDFGenerator {
  data: HealthSummaryData
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

  textStyles = {
    h1: {
      fontName: 'Open Sans',
      fontStyle: 'bold',
      fontSize: 18,
    } as TextStyle,
    h2: {
      fontName: 'Open Sans',
      fontStyle: 'regular',
      fontSize: 16,
      color: this.colors.primary,
    } as TextStyle,
    h3: {
      fontName: 'Open Sans',
      fontStyle: 'regular',
      fontSize: 15,
    } as TextStyle,
    body: {
      fontName: 'Open Sans',
      fontStyle: 'regular',
      fontSize: 10,
    } as TextStyle,
    bodyColored: {
      fontName: 'Open Sans',
      fontStyle: 'regular',
      fontSize: 10,
      color: this.colors.primary,
    } as TextStyle,
    bodyColoredBold: {
      fontName: 'Open Sans',
      fontStyle: 'bold',
      fontSize: 10,
      color: this.colors.primary,
    } as TextStyle,
    bodyBold: {
      fontName: 'Open Sans',
      fontStyle: 'bold',
      fontSize: 10,
    } as TextStyle,
  }

  constructor(data: HealthSummaryData) {
    this.data = data
    this.doc = new jsPDF('p', 'pt', [this.pageWidth, this.pageHeight])
    this.addFont('resources/fonts/OpenSans-Regular.ttf', 'Open Sans', 'regular')
    this.addFont('resources/fonts/OpenSans-Bold.ttf', 'Open Sans', 'bold')
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

    function colorForCategory(
      category: MedicationOptimizationCategory,
    ): string | undefined {
      switch (category) {
        case MedicationOptimizationCategory.targetDoseReached:
          return 'rgb(0,255,0)'
        case MedicationOptimizationCategory.improvementAvailable:
          return 'rgb(255,255,0)'
        case MedicationOptimizationCategory.notStarted:
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
      ...this.data.medications.map((medication, index) => [
        {
          title: '[ ] ' + medication.name,
        },
        {
          styles: {
            fillColor: colorForCategory(medication.category),
          },
          title: medication.dose,
        },
        {
          styles: {
            fillColor: colorForCategory(medication.category),
          },
          title: medication.targetDose,
        },
        {
          title: medication.potentialPositiveChange,
        },
        {
          styles: {
            lineWidth: {
              bottom: index === this.data.medications.length - 1 ? 0.5 : 0,
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
        const avgSystolic =
          this.data.vitals.systolicBloodPressure.reduce(
            (acc, observation) => acc + observation.value,
            0,
          ) / this.data.vitals.systolicBloodPressure.length
        this.addText(
          `Average Systolic Blood Pressure: ${avgSystolic.toFixed(0)}`,
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        const avgDiastolic =
          this.data.vitals.diastolicBloodPressure.reduce(
            (acc, observation) => acc + observation.value,
            0,
          ) / this.data.vitals.diastolicBloodPressure.length
        this.addText(
          `Average Diastolic Blood Pressure: ${avgDiastolic.toFixed(0)}`,
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        const avgHeartRate =
          this.data.vitals.heartRate.reduce(
            (acc, observation) => acc + observation.value,
            0,
          ) / this.data.vitals.heartRate.length
        this.addText(
          `Average Heart Rate: ${avgHeartRate.toFixed(0)}`,
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize)
      },
      (columnWidth) => {
        this.addText(
          `Current Weight: ${this.data.vitals.bodyWeight.at(0)?.value.toFixed(0) ?? '---'} lbs`,
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        this.addText(
          `Last Week Average Weight: ${this.data.vitals.bodyWeight.reduce((acc, val) => acc + val.value, 0) / this.data.vitals.bodyWeight.length} lbs`,
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        this.addText(
          `Prior Dry Weight: ${this.data.vitals.dryWeight.toFixed(0)} lbs`,
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
      ...this.data.symptomScores.map((survey, index) => [
        {
          title: this.formatDate(survey.date),
          styles: {
            fontStyle:
              index == this.data.symptomScores.length - 1 ? 'bold' : 'normal',
          },
        } as CellDef,
        {
          title: String(survey.overallScore),
        },
        {
          title: String(survey.physicalLimitsScore),
        },
        {
          title: String(survey.socialLimitsScore),
        },
        {
          title: String(survey.qualityOfLifeScore),
        },
        {
          title: String(survey.specificSymptomsScore),
        },
        {
          title: String(survey.dizzinessScore),
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
          this.data.vitals.dryWeight,
        )
        const avgWeight =
          this.data.vitals.bodyWeight.reduce(
            (acc, observation) => acc + observation.value,
            0,
          ) / this.data.vitals.bodyWeight.length
        const maxWeight = this.data.vitals.bodyWeight.reduce(
          (acc, observation) => Math.max(acc, observation.value),
          0,
        )
        const minWeight = this.data.vitals.bodyWeight.reduce(
          (acc, observation) => Math.min(acc, observation.value),
          Infinity,
        )
        this.addTable(
          [
            [' ', 'Current', '7-Day Average', 'Last Visit', 'Range'],
            [
              'Weight',
              this.data.vitals.bodyWeight.at(0)?.value.toFixed(0) ?? '---',
              avgWeight.toFixed(0),
              '-',
              (maxWeight - minWeight).toFixed(0),
            ],
          ],
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize * 2)
      },
      (columnWidth) => {
        this.addText('Heart Rate', this.textStyles.bodyBold, columnWidth)
        this.addChart(this.data.vitals.heartRate, columnWidth)
        const values = [...this.data.vitals.heartRate].sort(
          (a, b) => a.value - b.value,
        )
        const median = values.at(Math.floor(values.length / 2))
        const upperMedian = values.at(Math.floor(values.length * 0.75))
        const lowerMedian = values.at(Math.floor(values.length * 0.25))

        const percentageBelow =
          (this.data.vitals.heartRate.filter(
            (observation) => observation.value < 50,
          ).length /
            values.length) *
          100
        const percentageAbove =
          (this.data.vitals.heartRate.filter(
            (observation) => observation.value > 120,
          ).length /
            values.length) *
          100
        this.addTable(
          [
            [' ', 'Median', 'IQR', '% Under 50', '% Over 120'],
            [
              'Heart Rate',
              median?.value.toFixed(0) ?? '---',
              upperMedian && lowerMedian ?
                (upperMedian.value - lowerMedian.value).toFixed(0)
              : '---',
              percentageBelow.toFixed(0),
              percentageAbove.toFixed(0),
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

    const systolicValues = [...this.data.vitals.systolicBloodPressure].sort(
      (a, b) => a.value - b.value,
    )
    const systolicMedian = systolicValues.at(
      Math.floor(systolicValues.length / 2),
    )
    const systolicUpperMedian = systolicValues.at(
      Math.floor(systolicValues.length * 0.75),
    )
    const systolicLowerMedian = systolicValues.at(
      Math.floor(systolicValues.length * 0.25),
    )

    const diastolicValues = [...this.data.vitals.diastolicBloodPressure].sort(
      (a, b) => a.value - b.value,
    )
    const diastolicMedian = diastolicValues.at(
      Math.floor(diastolicValues.length / 2),
    )
    const diastolicUpperMedian = diastolicValues.at(
      Math.floor(diastolicValues.length * 0.75),
    )
    const diastolicLowerMedian = diastolicValues.at(
      Math.floor(diastolicValues.length * 0.25),
    )

    const percentageBelow =
      (this.data.vitals.systolicBloodPressure.filter(
        (observation) => observation.value < 90,
      ).length /
        systolicValues.length) *
      100
    const percentageAbove =
      (this.data.vitals.systolicBloodPressure.filter(
        (observation) => observation.value > 180,
      ).length /
        systolicValues.length) *
      100
    this.addTable([
      [' ', 'Median', 'IQR', '% Under 90 mmHg', '% Over 180 mmHg'],
      [
        'Systolic',
        systolicMedian?.value.toFixed(0) ?? '---',
        systolicUpperMedian && systolicLowerMedian ?
          (systolicUpperMedian.value - systolicLowerMedian.value).toFixed(0)
        : '---',
        percentageBelow.toFixed(0),
        percentageAbove.toFixed(0),
      ],
      [
        'Diastolic',
        diastolicMedian?.value.toFixed(0) ?? '---',
        diastolicUpperMedian && diastolicLowerMedian ?
          (diastolicUpperMedian.value - diastolicLowerMedian.value).toFixed(0)
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
        loadSystemFonts: true,
        fontDirs: ['resources/fonts'],
        defaultFontFamily: 'Open Sans',
        serifFamily: 'Open Sans',
        sansSerifFamily: 'Open Sans',
        cursiveFamily: 'Open Sans',
        fantasyFamily: 'Open Sans',
        monospaceFamily: 'Open Sans',
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
    const options: UserOptions = {
      margin: { left: this.cursor.x },
      theme: 'grid',
      startY: this.cursor.y,
      tableWidth: maxWidth ?? 'auto',
      body: rows,
      styles: {
        font: this.textStyles.body.fontName,
        fontStyle: 'normal',
        fontSize: this.textStyles.body.fontSize,
      },
    }
      ; (this.doc as any).autoTable(options) // eslint-disable-line
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

  addFont(file: string, name: string, style: string) {
    const fontFileContent = fs.readFileSync(file).toString('base64')
    const fileName = file.split('/').at(-1) ?? file
    this.doc.addFileToVFS(fileName, fontFileContent)
    this.doc.addFont(fileName, name, style)
  }
}
