import fs from 'fs'
import { CellConfig, jsPDF } from 'jspdf'
import 'jspdf-autotable'

export async function generateHealthSummary(data: HealthSummaryData): Promise<Uint8Array> {
  const generator = new HealthSummaryPDFGenerator(data)
  generator.addFirstPage()
  generator.addSecondPage()
  return generator.finish()
}

interface TextStyle {
  fontName: string,
  fontStyle: string,
  fontWeight?: string,
  fontSize: number,
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
    lightGray: [211, 211, 211] as [number, number, number]
  }

  textStyles = {
    h1: {
      fontName: 'Helvetica',
      fontStyle: 'Bold',
      fontSize: 18
    } as TextStyle,
    h2: {
      fontName: 'Helvetica',
      fontStyle: '',
      fontSize: 16,
      color: this.colors.primary
    } as TextStyle,
    h3: {
      fontName: 'Helvetica',
      fontStyle: '',
      fontSize: 15
    } as TextStyle,
    body: {
      fontName: 'Helvetica',
      fontStyle: '',
      fontSize: 10
    } as TextStyle,
    bodyColored: {
      fontName: 'Helvetica',
      fontStyle: '',
      fontSize: 10,
      color: this.colors.primary
    } as TextStyle,
    bodyBold: {
      fontName: 'Helvetica',
      fontStyle: 'Bold',
      fontSize: 10
    } as TextStyle
  }

  constructor(data: HealthSummaryData) {
    this.data = data
    this.doc = new jsPDF('p', 'pt', [this.pageWidth, this.pageHeight])
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

  finish(): Uint8Array {
    return Buffer.from(this.doc.output('arraybuffer'))
  }

  addMedicationSection() {
    this.addSectionTitle('MEDICATIONS')
    this.moveDown(4)

    this.splitTwoColumns(
      (columnWidth) => {
        this.addText('Current Medications', this.textStyles.bodyBold, columnWidth)
        this.moveDown(this.textStyles.body.fontSize + 4)
        this.data.currentMedications.forEach((medication) => {
          this.addText(`${medication.name} - ${medication.instruction}`, medication.isBold ? this.textStyles.bodyBold : this.textStyles.body, columnWidth)
          this.moveDown(4)
        })
      },
      (columnWidth) => {
        this.addText('Potential Medication Optimizations', this.textStyles.bodyBold, columnWidth)
        this.moveDown(this.textStyles.body.fontSize + 4)
        this.data.proposedMedications.forEach((medication) => {
          this.addText(`${medication.name} - ${medication.instruction}`, medication.isBold ? this.textStyles.bodyBold : this.textStyles.body, columnWidth)
          this.moveDown(4)
        })
        this.moveDown(this.textStyles.body.fontSize)
        this.addText('Based on your current vitals, labs, and symptoms, consider discussing optimizing these medications with your care team. Please consider starting with the bolded medication change.', this.textStyles.bodyColored, columnWidth)
        this.moveDown(4)
      }
    )
  }

  addVitalsSection() {
    this.addSectionTitle('VITALS OVER LAST 2 WEEKS')
    this.moveDown(4)
    this.addText(`Average Systolic Blood Pressure: ${this.data.vitals.systolicBloodPressure.reduce((acc, val) => acc + val.value, 0) / this.data.vitals.systolicBloodPressure.length}`, this.textStyles.body)
    this.moveDown(4)
    this.addText(`Average Diastolic Blood Pressure: ${this.data.vitals.diastolicBloodPressure.reduce((acc, val) => acc + val.value, 0) / this.data.vitals.diastolicBloodPressure.length}`, this.textStyles.body)
    this.moveDown(4)
    this.addText(`Average Heart Rate: ${this.data.vitals.heartRate.reduce((acc, val) => acc + val.value, 0) / this.data.vitals.heartRate.length}`, this.textStyles.body)
    this.moveDown(4)
    this.addText(`Current Weight: ${this.data.vitals.weight[0].value.toFixed(0)} lbs`, this.textStyles.body)
    this.moveDown(4)
    this.addText(`Last Week Average Weight: ${this.data.vitals.weight.reduce((acc, val) => acc + val.value, 0) / this.data.vitals.weight.length} lbs`, this.textStyles.body)
    this.moveDown(4)
    this.addText(`Prior Dry Weight: ${this.data.vitals.dryWeight.toFixed(0)} lbs`, this.textStyles.body)
    this.moveDown(4)
  }

  addSymptomsSurveySection() {
    this.addSectionTitle('SYMPTOM SURVEY [KCCQ-12] REPORT')
    this.moveDown(4)
    this.splitTwoColumns(
      (columnWidth) => {
        this.addPNG(fs.readFileSync('res/kccqWheel.png'), columnWidth)
      },
      (columnWidth) => {
        this.addText('These symptom scores range from 0-100.', this.textStyles.body, columnWidth)
        this.moveDown(4)
        this.addText('A score of 0 indicates severe symptoms.', this.textStyles.body, columnWidth)
        this.moveDown(4)
        this.addText('A score of 100 indicates you are doing extremely well.', this.textStyles.body, columnWidth)
        this.moveDown(this.textStyles.body.fontSize)
        this.addText('Personal Summary: Your symptom scores have decreased. This means you are feeling worse. This is helpful to document to make sure you are on the right medical therapy.', this.textStyles.bodyColored, columnWidth)
      }
    )

    this.moveDown(8)
    
    const tableContent = [
      [' ', 'Overall Score', 'Physical Limits', 'Social Limits', 'Quality of Life', 'Heart Failure Symptoms', 'Dizziness'],
      ...this.data.symptomScores.map((survey) => [this.formatDate(survey.date), String(survey.overall), String(survey.physicalLimits), String(survey.socialLimits), String(survey.qualityOfLife), String(survey.specificSymptoms), String(survey.dizziness)]),
    ]
    this.addTable(tableContent)
    this.moveDown(this.textStyles.body.fontSize)
  }

  addVitalsChartsSection() {
    this.addSectionTitle('DETAILS OF VITALS')

    this.splitTwoColumns(
      columnWidth => {
        this.addText('Weight',  this.textStyles.bodyBold, columnWidth)
        const avgWeight = this.data.vitals.weight.reduce((acc, observation) => acc + observation.value, 0) / this.data.vitals.weight.length
        const maxWeight = this.data.vitals.weight.reduce((acc, observation) => Math.max(acc, observation.value), 0)
        const minWeight = this.data.vitals.weight.reduce((acc, observation) => Math.min(acc, observation.value), Infinity)
        this.addTable(
          [
            [' ', 'Current', '7-Day Average', 'Last Visit', 'Range'],
            ['Weight', this.data.vitals.weight[0].value.toFixed(0), avgWeight.toFixed(0), '-', (maxWeight - minWeight).toFixed(0)]
          ],
          columnWidth
        )
        this.moveDown(this.textStyles.body.fontSize * 2)
      },
      columnWidth => {
        this.addText('Heart Rate', this.textStyles.bodyBold, columnWidth)
        const values = [...this.data.vitals.heartRate].sort((a, b) => a.value - b.value)
        console.log(values, values.length / 2)
        const median = values[Math.floor(values.length / 2)]
        const upperMedian = values[Math.floor(values.length * .75)]
        const lowerMedian = values[Math.floor(values.length * .25)]

        const percentageBelow = this.data.vitals.heartRate.filter(observation => observation.value < 50).length / values.length
        const percentageAbove = this.data.vitals.heartRate.filter(observation => observation.value > 120).length / values.length
        this.addTable(
          [
            [' ', 'Median', 'IQR', '% Under 50', '% Over 120'],
            ['Heart Rate', median.value.toFixed(0), (upperMedian.value - lowerMedian.value).toFixed(0), percentageBelow.toFixed(0), percentageAbove.toFixed(0)]
          ],
          columnWidth
        )
        this.moveDown(this.textStyles.body.fontSize * 2)
      },
    )

    this.splitTwoColumns(
      columnWidth => {
        this.addText('Systolic Blood Pressure', this.textStyles.bodyBold, columnWidth)
        const systolicValues = [...this.data.vitals.systolicBloodPressure].sort((a, b) => a.value - b.value)
        const systolicMedian = systolicValues[Math.floor(systolicValues.length / 2)]
        const systolicUpperMedian = systolicValues[Math.floor(systolicValues.length * .75)]
        const systolicLowerMedian = systolicValues[Math.floor(systolicValues.length * 0.25)]

        const diastolicValues = [...this.data.vitals.diastolicBloodPressure].sort((a, b) => a.value - b.value)
        const diastolicMedian = diastolicValues[Math.floor(diastolicValues.length / 2)]
        const diastolicUpperMedian = diastolicValues[Math.floor(diastolicValues.length * 0.75)]
        const diastolicLowerMedian = diastolicValues[Math.floor(diastolicValues.length * 0.25)]

        const percentageBelow = this.data.vitals.systolicBloodPressure.filter(observation => observation.value < 50).length / systolicValues.length
        const percentageAbove = this.data.vitals.systolicBloodPressure.filter(observation => observation.value > 120).length / systolicValues.length
        this.addTable(
          [
            [' ', 'Median', 'IQR', '% Under 50', '% Over 120'],
            ['Systolic', systolicMedian.value.toFixed(0), (systolicUpperMedian.value - systolicLowerMedian.value).toFixed(0), percentageBelow.toFixed(0), percentageAbove.toFixed(0)],
            ['Diastolic', diastolicMedian.value.toFixed(0), (diastolicUpperMedian.value - diastolicLowerMedian.value).toFixed(0), '-', '-']
          ],
          columnWidth
        )
        this.moveDown(this.textStyles.body.fontSize * 2)
      },
      columnWidth => {
        this.addText('Diastolic Blood Pressure', this.textStyles.bodyBold, columnWidth)

      },
    )
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
    this.addText(`Next Appointment: ${this.formatDate(this.data.nextAppointment)}`)
    this.moveDown(8)

    const innerWidth = this.pageWidth - this.margins.left - this.margins.right
    this.addLine(
      { x: this.cursor.x, y: this.cursor.y },
      { x: this.cursor.x + innerWidth, y: this.cursor.y },
      this.colors.black,
      1
    )
    this.addLine(
      { x: this.cursor.x + innerWidth - 18, y: this.cursor.y - 30 },
      { x: this.cursor.x + innerWidth + 18, y: this.cursor.y - 30 },
      this.colors.lightGray,
      0.5
    )
    this.moveDown(8)
    
    const headerFinalCursor = { x: this.cursor.x, y: this.cursor.y }
    this.cursor.x = this.cursor.x + innerWidth - 18
    this.cursor.y = this.cursor.y - 30
    this.addText(`Page ${this.doc.getNumberOfPages()}`, this.textStyles.body, 36)
    this.cursor = headerFinalCursor
  }

  addSectionTitle(title: string) {
    this.moveDown(8)
    this.addText(title, this.textStyles.h3)
    this.moveDown(4)
  }

  addPNG(data: Buffer, maxWidth?: number) {
    const width = maxWidth ?? (this.pageWidth - this.margins.left - this.margins.right)
    const imgData = 'data:image/png;base64,' + data.toString('base64')
    const imgProperties = this.doc.getImageProperties(imgData)
    const imgHeight = width / (imgProperties.width / imgProperties.height)
    this.doc.addImage(imgData, this.cursor.x, this.cursor.y, width, imgHeight)
    this.moveDown(imgHeight)
  }

  addTable(rows: string[][], maxWidth?: number) {
    (this.doc as any).autoTable({
      theme: 'grid',
      startY: this.cursor.y,
      tableWidth: maxWidth ?? 'auto',
      body: rows,
    })

    this.cursor.y = (this.doc as any).lastAutoTable.finalY
  }

  addText(text: string, textStyle: TextStyle = this.textStyles.body, maxWidth?: number) {
    this.doc.setFont(textStyle.fontName, textStyle.fontStyle, textStyle.fontWeight)
    this.doc.setFontSize(textStyle.fontSize)
    const previousTextColor = this.doc.getTextColor()
    if (textStyle.color) {
      this.doc.setTextColor(textStyle.color[0], textStyle.color[1], textStyle.color[2])
    }
    const textWidth = maxWidth ?? (this.pageWidth - this.cursor.x - this.margins.right)
    const splitText = this.doc.splitTextToSize(text, textWidth) as string[]
    for (const textSegment of splitText) {
      this.doc.text(textSegment, this.cursor.x, this.cursor.y + textStyle.fontSize / 2)
      this.cursor.y += textStyle.fontSize
    }
    if (textStyle.color) {
      this.doc.setTextColor(previousTextColor)
    }
  }

  addLine(start: { x: number, y: number }, end: { x: number, y: number }, color: [number, number, number], width: number) {
    this.doc.setLineWidth(width)
    this.doc.setDrawColor(color[0], color[1], color[2])
    this.doc.line(start.x, start.y, end.x, end.y)
  }

  splitTwoColumns(firstColumn: (width: number) => void, secondColumn: (width: number) => void) {
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
      y: Math.max(firstColumnMaxY, this.cursor.y)
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
