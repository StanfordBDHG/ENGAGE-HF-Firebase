//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import fs from 'fs'
import { assert, expect } from 'chai'
import { generateHealthSummary } from './generate.js'
import { mockHealthSummaryData } from '../tests/mocks/healthSummaryData.js'
import { TestFlags } from '../tests/testFlags.js'

/* eslint-disable @typescript-eslint/no-unnecessary-condition */

describe('generateHealthSummary', () => {
  function comparePdf(actual: Buffer, expected: Buffer) {
    assert.equal(actual.length, expected.length)
    function removeUniqueValues(pdf: string): string {
      return pdf
        .split('\n')
        .filter(
          (line) =>
            !line.startsWith('/CreationDate ') && !line.startsWith('/ID '),
        )
        .join('\n')
    }
    expect(removeUniqueValues(actual.toString('utf8'))).to.equal(
      removeUniqueValues(expected.toString('utf8')),
    )
  }

  it('should still create as nice of a PDF as before', () => {
    const inputData = mockHealthSummaryData()
    const actualData = generateHealthSummary(inputData)
    const expectedPath = 'src/tests/resources/mockHealthSummary.pdf'
    if (TestFlags.regenerateValues) {
      fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      comparePdf(actualData, expectedData)
    }
  })

  it('should not fail on empty data', () => {
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
    const actualData = generateHealthSummary(inputData)
    const expectedPath = 'src/tests/resources/emptyHealthSummary.pdf'
    if (TestFlags.regenerateValues) {
      fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      comparePdf(actualData, expectedData)
    }
  })
})
