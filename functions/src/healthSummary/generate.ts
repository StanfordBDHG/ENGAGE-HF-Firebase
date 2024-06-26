import { jsPDF } from 'jspdf'
import { type CellDef, type RowInput, type UserOptions } from 'jspdf-autotable'
import svg2img from 'svg2img'
import { generateChartSvg } from './generateChart.js'
import { generateSpeedometerSvg } from './generateSpeedometer.js'

export async function generateHealthSummary(
  data: HealthSummaryData,
): Promise<Uint8Array> {
  const generator = new HealthSummaryPDFGenerator(data)
  await generator.addFirstPage()
  await generator.addSecondPage()
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
      fontName: 'Helvetica',
      fontStyle: 'Bold',
      fontSize: 18,
    } as TextStyle,
    h2: {
      fontName: 'Helvetica',
      fontStyle: '',
      fontSize: 16,
      color: this.colors.primary,
    } as TextStyle,
    h3: {
      fontName: 'Helvetica',
      fontStyle: '',
      fontSize: 15,
    } as TextStyle,
    body: {
      fontName: 'Helvetica',
      fontStyle: '',
      fontSize: 10,
    } as TextStyle,
    bodyColored: {
      fontName: 'Helvetica',
      fontStyle: '',
      fontSize: 10,
      color: this.colors.primary,
    } as TextStyle,
    bodyBold: {
      fontName: 'Helvetica',
      fontStyle: 'Bold',
      fontSize: 10,
    } as TextStyle,
  }

  constructor(data: HealthSummaryData) {
    this.data = data
    this.doc = new jsPDF('p', 'pt', [this.pageWidth, this.pageHeight])
  }

  async addFirstPage() {
    this.addPageHeader()
    await this.addMedicationSection()
    await this.addVitalsSection()
    await this.addSymptomsSurveySection()
  }

  async addSecondPage() {
    this.addPage()
    await this.addVitalsChartsSection()
  }

  finish(): Uint8Array {
    return Buffer.from(this.doc.output('arraybuffer'))
  }

  async addMedicationSection() {
    this.addSectionTitle('MEDICATIONS')
    this.moveDown(4)

    await this.splitTwoColumns(
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
          'Please discuss optimizing these medications with your care them at your next clinic appointment. Aim to make one positive change!',
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize)
      },
    )

    function colorForCategory(
      category: MedicationRequest['category'],
    ): string | undefined {
      switch (category) {
        case 'targetDoseReached':
          return 'rgb(0,255,0)'
        case 'improvementAvailable':
          return 'rgb(255,255,0)'
        case 'notStarted':
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
      ...this.data.medicationRequests.map((request, index) => [
        {
          title: '[ ] ' + request.name,
        },
        {
          styles: {
            fillColor: colorForCategory(request.category),
          },
          title: request.dose,
        },
        {
          styles: {
            fillColor: colorForCategory(request.category),
          },
          title: request.targetDose,
        },
        {
          title: request.potentialPositiveChange,
        },
        {
          styles: {
            lineWidth: {
              bottom:
                index === this.data.medicationRequests.length - 1 ? 0.5 : 0,
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

  async addVitalsSection() {
    this.addSectionTitle('VITALS OVER LAST 2 WEEKS')
    this.moveDown(4)
    await this.splitTwoColumns(
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
      async (columnWidth) => { // eslint-disable-line
        this.addText(
          `Current Weight: ${this.data.vitals.weight[0].value.toFixed(0)} lbs`,
          this.textStyles.body,
          columnWidth,
        )
        this.moveDown(4)
        this.addText(
          `Last Week Average Weight: ${this.data.vitals.weight.reduce((acc, val) => acc + val.value, 0) / this.data.vitals.weight.length} lbs`,
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

  async addSymptomsSurveySection() {
    this.addSectionTitle('SYMPTOM SURVEY [KCCQ-12] REPORT')
    this.moveDown(4)

    await this.splitTwoColumns(
      async (columnWidth) => {
        await this.addSpeedometer(columnWidth)
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

    const tableContent = [
      [
        ' ',
        'Overall Score',
        'Physical Limits',
        'Social Limits',
        'Quality of Life',
        'Heart Failure Symptoms',
        'Dizziness',
      ],
      ...this.data.symptomScores.map((survey) => [
        this.formatDate(survey.date),
        String(survey.overall),
        String(survey.physicalLimits),
        String(survey.socialLimits),
        String(survey.qualityOfLife),
        String(survey.specificSymptoms),
        String(survey.dizziness),
      ]),
    ]
    this.addTable(tableContent)
    this.moveDown(this.textStyles.body.fontSize)
  }

  async addVitalsChartsSection() {
    this.addSectionTitle('DETAILS OF VITALS')

    await this.splitTwoColumns(
      async (columnWidth) => {
        this.addText('Weight', this.textStyles.bodyBold, columnWidth)
        await this.addChart(this.data.vitals.weight, columnWidth)
        const avgWeight =
          this.data.vitals.weight.reduce(
            (acc, observation) => acc + observation.value,
            0,
          ) / this.data.vitals.weight.length
        const maxWeight = this.data.vitals.weight.reduce(
          (acc, observation) => Math.max(acc, observation.value),
          0,
        )
        const minWeight = this.data.vitals.weight.reduce(
          (acc, observation) => Math.min(acc, observation.value),
          Infinity,
        )
        this.addTable(
          [
            [' ', 'Current', '7-Day Average', 'Last Visit', 'Range'],
            [
              'Weight',
              this.data.vitals.weight[0].value.toFixed(0),
              avgWeight.toFixed(0),
              '-',
              (maxWeight - minWeight).toFixed(0),
            ],
          ],
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize * 2)
      },
      async (columnWidth) => {
        this.addText('Heart Rate', this.textStyles.bodyBold, columnWidth)
        await this.addChart(this.data.vitals.heartRate, columnWidth)
        const values = [...this.data.vitals.heartRate].sort(
          (a, b) => a.value - b.value,
        )
        const median = values[Math.floor(values.length / 2)]
        const upperMedian = values[Math.floor(values.length * 0.75)]
        const lowerMedian = values[Math.floor(values.length * 0.25)]

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
              median.value.toFixed(0),
              (upperMedian.value - lowerMedian.value).toFixed(0),
              percentageBelow.toFixed(0),
              percentageAbove.toFixed(0),
            ],
          ],
          columnWidth,
        )
        this.moveDown(this.textStyles.body.fontSize * 2)
      },
    )

    await this.splitTwoColumns(
      async (columnWidth) => {
        this.addText(
          'Systolic Blood Pressure',
          this.textStyles.bodyBold,
          columnWidth,
        )
        await this.addChart(this.data.vitals.systolicBloodPressure, columnWidth)
      },
      async (columnWidth) => {
        this.addText(
          'Diastolic Blood Pressure',
          this.textStyles.bodyBold,
          columnWidth,
        )
        await this.addChart(
          this.data.vitals.diastolicBloodPressure,
          columnWidth,
        )
      },
    )

    const systolicValues = [...this.data.vitals.systolicBloodPressure].sort(
      (a, b) => a.value - b.value,
    )
    const systolicMedian = systolicValues[Math.floor(systolicValues.length / 2)]
    const systolicUpperMedian =
      systolicValues[Math.floor(systolicValues.length * 0.75)]
    const systolicLowerMedian =
      systolicValues[Math.floor(systolicValues.length * 0.25)]

    const diastolicValues = [...this.data.vitals.diastolicBloodPressure].sort(
      (a, b) => a.value - b.value,
    )
    const diastolicMedian =
      diastolicValues[Math.floor(diastolicValues.length / 2)]
    const diastolicUpperMedian =
      diastolicValues[Math.floor(diastolicValues.length * 0.75)]
    const diastolicLowerMedian =
      diastolicValues[Math.floor(diastolicValues.length * 0.25)]

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
        systolicMedian.value.toFixed(0),
        (systolicUpperMedian.value - systolicLowerMedian.value).toFixed(0),
        percentageBelow.toFixed(0),
        percentageAbove.toFixed(0),
      ],
      [
        'Diastolic',
        diastolicMedian.value.toFixed(0),
        (diastolicUpperMedian.value - diastolicLowerMedian.value).toFixed(0),
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
    this.addText(`DOB: ${this.formatDate(this.data.dateOfBirth)}`)
    this.moveDown(4)
    this.addText(`Provider: ${this.data.provider}`)
    this.moveDown(4)
    this.addText(
      `Next Appointment: ${this.formatDate(this.data.nextAppointment)}`,
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

  async addChart(data: Observation[], maxWidth?: number) {
    const width =
      maxWidth ?? this.pageWidth - this.cursor.x - this.margins.right
    const height = width * 0.75
    const svg = generateChartSvg(
      data,
      { width: width, height: height },
      { top: 20, right: 40, bottom: 40, left: 40 },
    )
    const img = await this.convertSvgToPng(svg)
    this.addPNG(img, width)
  }

  async addSpeedometer(maxWidth?: number) {
    const width =
      maxWidth ?? this.pageWidth - this.cursor.x - this.margins.right
    const svg = generateSpeedometerSvg(this.data.symptomScores, width)
    const img = await this.convertSvgToPng(svg)
    this.addPNG(img, width)
  }

  async convertSvgToPng(svg: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      svg2img(
        svg,
        {
          resvg: {
            shapeRendering: 2,
            textRendering: 1,
            imageRendering: 0,
            fitTo: { mode: 'zoom', value: 5 },
          },
        },
        (error, buffer) => {
          if (error) reject(new Error(`Error converting SVG to PNG: ${error}`))
          else resolve(buffer as Buffer)
        },
      )
    })
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

  async splitTwoColumns(
    firstColumn: (width: number) => Promise<void> | void,
    secondColumn: (width: number) => Promise<void> | void,
  ) {
    const cursorBeforeSplit = structuredClone(this.cursor)
    const splitMargin = 8
    const innerWidth = this.pageWidth - this.margins.left - this.margins.right
    const columnWidth = innerWidth / 2 - splitMargin
    await firstColumn(columnWidth)
    const firstColumnMaxY = this.cursor.y
    this.cursor = structuredClone(cursorBeforeSplit)
    this.cursor.x += columnWidth + splitMargin
    await secondColumn(columnWidth)
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
}
