import fs from 'fs'
import { assert, expect } from 'chai'
import { generateHealthSummary } from './generate.js'
import { mockHealthSummaryData } from '../tests/mocks/healthSummaryData.js'

/* eslint-disable @typescript-eslint/no-unnecessary-condition */

describe('generateHealthSummary', () => {
  const exportActualPdfs = true
  const pdfMetadataSuffixLength = 1000

  it('should still create as nice of a PDF as before', async () => {
    const inputData = mockHealthSummaryData()
    const actualData = await generateHealthSummary(inputData)
    if (exportActualPdfs)
      fs.writeFileSync(
        'src/tests/resources/mockHealthSummary-actual.pdf',
        actualData,
      )
    const expectedData = fs.readFileSync(
      'src/tests/resources/mockHealthSummary.pdf',
    )
    assert.equal(actualData.length, expectedData.length)
    const maxIndex = actualData.length - pdfMetadataSuffixLength
    expect(
      Buffer.from(actualData).compare(expectedData, 0, maxIndex, 0, maxIndex),
    ).to.equal(0)
  })

  it('should not fail on empty data', async () => {
    const inputData = mockHealthSummaryData()
    inputData.dateOfBirth = undefined
    inputData.nextAppointment = undefined
    inputData.medications = []
    inputData.symptomScores = []
    inputData.vitals.systolicBloodPressure = []
    inputData.vitals.diastolicBloodPressure = []
    inputData.vitals.heartRate = []
    inputData.vitals.bodyWeight = [{ date: new Date('2000-01-01'), value: NaN }]
    inputData.vitals.dryWeight = NaN
    const actualData = await generateHealthSummary(inputData)
    if (exportActualPdfs)
      fs.writeFileSync(
        'src/tests/resources/emptyHealthSummary-actual.pdf',
        actualData,
      )
    const expectedData = fs.readFileSync(
      'src/tests/resources/emptyHealthSummary.pdf',
    )
    assert.equal(actualData.length, expectedData.length)
    const maxIndex = actualData.length - pdfMetadataSuffixLength
    expect(
      Buffer.from(actualData).compare(expectedData, 0, maxIndex, 0, maxIndex),
    ).to.equal(0)
  })
})
