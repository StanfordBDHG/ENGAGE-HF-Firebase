import assert from 'assert'
import fs from 'fs'
import { describe, it } from 'mocha'
import { generateSpeedometerSvg } from './generateSpeedometer.js'
import { mockHealthSummaryData } from '../tests/mocks/healthSummaryData.js'

/* eslint-disable @typescript-eslint/no-unnecessary-condition */

describe('generateSpeedometer', () => {
  const exportActualSvgs = false

  it('should generate the same chart on mock data', () => {
    const inputData = mockHealthSummaryData()
    const actualData = generateSpeedometerSvg(inputData.symptomScores, 258)
    if (exportActualSvgs)
      fs.writeFileSync(
        'src/tests/resources/mockSpeedometer-actual.svg',
        actualData,
      )
    const expectedData = fs.readFileSync(
      'src/tests/resources/mockSpeedometer.svg',
    )

    assert.equal(actualData, expectedData.toString('utf8'))
  })

  it('should generate an empty chart the same way', () => {
    const actualData = generateSpeedometerSvg([], 258)
    if (exportActualSvgs)
      fs.writeFileSync(
        'src/tests/resources/emptySpeedometer-actual.svg',
        actualData,
      )
    const expectedData = fs.readFileSync(
      'src/tests/resources/emptySpeedometer.svg',
    )
    assert.equal(actualData, expectedData.toString('utf8'))
  })
})
