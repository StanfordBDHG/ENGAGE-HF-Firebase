import assert from 'assert'
import fs from 'fs'
import { describe, it } from 'mocha'
import { generateSpeedometerSvg } from './generateSpeedometer.js'
import { mockHealthSummaryData } from '../tests/mocks/healthSummaryData.js'

/* eslint-disable @typescript-eslint/no-unnecessary-condition */

describe('generateSpeedometer', () => {
  const regenerateValues = process.env.REGENERATE_VALUES === 'true'

  it('should generate the same chart on mock data', () => {
    const inputData = mockHealthSummaryData()
    const actualData = generateSpeedometerSvg(inputData.symptomScores, 258)
    const expectedPath = 'src/tests/resources/mockSpeedometer.svg'
    if (regenerateValues) {
      fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      assert.equal(actualData, expectedData.toString('utf8'))
    }
  })

  it('should generate an empty chart the same way', () => {
    const actualData = generateSpeedometerSvg([], 258)
    const expectedPath = 'src/tests/resources/emptySpeedometer.svg'
    if (regenerateValues) {
      fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      assert.equal(actualData, expectedData.toString('utf8'))
    }
  })
})
