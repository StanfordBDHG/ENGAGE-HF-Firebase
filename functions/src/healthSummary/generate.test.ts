import fs from 'fs'
import { assert, expect } from 'chai'
import { generateHealthSummary } from './generate.js'
import { mockHealthSummaryData } from '../tests/mocks/healthSummaryData.js'

/* eslint-disable @typescript-eslint/no-unnecessary-condition */

describe('generateHealthSummary', () => {
  const overrideValues = process.env.OVERRIDE_VALUES === 'true'
  const pdfMetadataSuffixLength = 1000

  it('should still create as nice of a PDF as before', async () => {
    const inputData = mockHealthSummaryData()
    const actualData = await generateHealthSummary(inputData)
    const expectedPath = 'src/tests/resources/mockHealthSummary.pdf'
    if (overrideValues) {
      fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      assert.equal(actualData.length, expectedData.length)
      const maxIndex = actualData.length - pdfMetadataSuffixLength
      expect(Buffer.from(actualData).toString('utf8').substring(0, maxIndex)).to.equal(
        expectedData.toString('utf8').substring(0, maxIndex),
      )
    }
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
    const expectedPath = 'src/tests/resources/emptyHealthSummary.pdf'
    if (overrideValues) {
      fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      assert.equal(actualData.length, expectedData.length)
      const maxIndex = actualData.length - pdfMetadataSuffixLength
      expect(Buffer.from(actualData).toString('utf8').substring(0, maxIndex)).to.equal(
        expectedData.toString('utf8').substring(0, maxIndex),
      )
    }
  })
})
