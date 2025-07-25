//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import fs from 'fs'
import { generateHealthSummary } from './generate.js'
import { type HealthSummaryData } from '../models/healthSummaryData.js'
import { mockHealthSummaryData } from '../tests/mocks/healthSummaryData.js'
import { TestFlags } from '../tests/testFlags.js'

describe('generateHealthSummary', () => {
  function comparePdf(actual: Buffer, expected: Buffer): boolean {
    if (!TestFlags.regenerateValues) expect(actual.length).toBe(expected.length)
    expect(actual.length).toBeLessThan(1_000_000)
    function removeUniqueValues(pdf: string): string {
      return pdf
        .split('\n')
        .filter(
          (line) =>
            !line.startsWith('/CreationDate ') &&
            !line.startsWith('/ID ') &&
            !line.startsWith('/Producer '),
        )
        .join('\n')
    }
    const reducedActual = removeUniqueValues(actual.toString('utf8'))
    const reducedExpected = removeUniqueValues(expected.toString('utf8'))
    if (!TestFlags.regenerateValues) expect(reducedActual).toBe(reducedExpected)
    return reducedActual === reducedExpected
  }

  let inputData: HealthSummaryData

  beforeEach(async () => {
    inputData = await mockHealthSummaryData('')
  })

  it('should still create as nice of a PDF as before (en)', () => {
    const actualData = generateHealthSummary(inputData, {
      languages: ['en_US'],
    })
    const expectedPath = 'src/tests/resources/mockHealthSummary-en.pdf'
    if (TestFlags.regenerateValues) {
      if (!comparePdf(actualData, fs.readFileSync(expectedPath)))
        fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      comparePdf(actualData, expectedData)
    }
  })

  it('should still create as nice of a PDF as before (es)', () => {
    const actualData = generateHealthSummary(inputData, {
      languages: ['es'],
    })
    const expectedPath = 'src/tests/resources/mockHealthSummary-es.pdf'
    if (TestFlags.regenerateValues) {
      if (!comparePdf(actualData, fs.readFileSync(expectedPath)))
        fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      comparePdf(actualData, expectedData)
    }
  })

  it('should not fail on empty data (en)', () => {
    inputData.dateOfBirth = undefined
    inputData.nextAppointment = undefined
    inputData.recommendations = []
    inputData.symptomScores = []
    inputData.vitals.systolicBloodPressure = []
    inputData.vitals.diastolicBloodPressure = []
    inputData.vitals.heartRate = []
    inputData.vitals.bodyWeight = []
    inputData.vitals.dryWeight = undefined
    const actualData = generateHealthSummary(inputData, {
      languages: ['en-US'],
    })
    const expectedPath = 'src/tests/resources/emptyHealthSummary-en.pdf'
    if (TestFlags.regenerateValues) {
      if (!comparePdf(actualData, fs.readFileSync(expectedPath)))
        fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      comparePdf(actualData, expectedData)
    }
  })

  it('should not fail on empty data (es)', () => {
    inputData.dateOfBirth = undefined
    inputData.nextAppointment = undefined
    inputData.recommendations = []
    inputData.symptomScores = []
    inputData.vitals.systolicBloodPressure = []
    inputData.vitals.diastolicBloodPressure = []
    inputData.vitals.heartRate = []
    inputData.vitals.bodyWeight = []
    inputData.vitals.dryWeight = undefined
    const actualData = generateHealthSummary(inputData, {
      languages: ['es'],
    })
    const expectedPath = 'src/tests/resources/emptyHealthSummary-es.pdf'
    if (TestFlags.regenerateValues) {
      if (!comparePdf(actualData, fs.readFileSync(expectedPath)))
        fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      comparePdf(actualData, expectedData)
    }
  })
})
