import { assert } from 'chai'
import { generateHealthSummary } from './generate.js'
import { mockHealthSummaryData } from '../tests/mocks/healthSummaryData.js'

describe('generateHealthSummary', () => {
  it('should still create as nice of a PDF as before', async () => {
    const data = mockHealthSummaryData()
    const result = await generateHealthSummary(data)
    assert.equal(result.length, 23581335)
  })

  it('should not fail on empty data', async () => {
    const data = mockHealthSummaryData()
    data.dateOfBirth = undefined
    data.nextAppointment = undefined
    data.medications = []
    data.symptomScores = []
    data.vitals.systolicBloodPressure = []
    data.vitals.diastolicBloodPressure = []
    data.vitals.heartRate = []
    data.vitals.bodyWeight = []
    data.vitals.dryWeight = NaN
    const result = await generateHealthSummary(data)
    assert.equal(result.length, 8587295)
  })
})
