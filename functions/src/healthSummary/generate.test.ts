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
import {
  HealthSummaryKeyPointMessage,
  type HealthSummaryData,
} from '../models/healthSummaryData.js'
import { mockHealthSummaryData } from '../tests/mocks/healthSummaryData.js'
import { TestFlags } from '../tests/testFlags.js'
import { readCsv } from '../tests/helpers/csv.js'

describe('generateHealthSummary', () => {
  function comparePdf(actual: Buffer, expected: Buffer): boolean {
    if (!TestFlags.regenerateValues)
      assert.equal(actual.length, expected.length)
    expect(actual.length).to.be.lessThan(1_000_000)
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
    if (!TestFlags.regenerateValues)
      expect(reducedActual).to.equal(reducedExpected)
    return reducedActual === reducedExpected
  }

  let inputData: HealthSummaryData

  beforeEach(async () => {
    inputData = await mockHealthSummaryData('')
  })

  it('should still create as nice of a PDF as before', () => {
    const actualData = generateHealthSummary(inputData, {
      languages: ['en_US'],
    })
    const expectedPath = 'src/tests/resources/mockHealthSummary.pdf'
    if (TestFlags.regenerateValues) {
      if (!comparePdf(actualData, fs.readFileSync(expectedPath)))
        fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      comparePdf(actualData, expectedData)
    }
  })

  it('should not fail on empty data', () => {
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
    const expectedPath = 'src/tests/resources/emptyHealthSummary.pdf'
    if (TestFlags.regenerateValues) {
      if (!comparePdf(actualData, fs.readFileSync(expectedPath)))
        fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      comparePdf(actualData, expectedData)
    }
  })

  it('should generate the correct key point messages', () => {
    const allMessages = new Set<string>()
    readCsv('src/tests/resources/keyPointMessages.csv', 55, (line, index) => {
      if (index === 0) return

      switch (line[0]) {
        case 'Eligible meds for optimization':
          break
        case 'No eligible meds at optimization; measure BP':
          break
        case 'No eligible meds at optimization; at target doses':
          break
        default:
          console.log('Unknown item at 0:', line[0])
      }

      switch (line[1]) {
        case 'Change >-10 and KCCQ<90':
          break
        case 'Change >-10 and KCCQ>=90':
          break
        case 'Change <-10':
          break
        default:
          console.log('Unknown item at 1:', line[1])
      }

      switch (line[2]) {
        case 'No decrease <-25':
          break
        case 'Decrease <-25':
          break
        default:
          console.log('Unknown item at 2:', line[2])
      }

      switch (line[3]) {
        case 'No weight gain but weight measured':
          break
        case 'Weight increase':
          break
        case 'No weight measured':
          break
        default:
          console.log('Unknown item at 3:', line[3])
      }

      const newMessages = separateKeyPointMessages(line[4])
      for (const newMessage of newMessages) {
        allMessages.add(newMessage)
      }
      // console.log(line)
    })
    console.log(Array.from(allMessages.values()).sort())
  })
})

function separateKeyPointMessages(string: string): string[] {
  return string
    .split('\n')
    .map((line) =>
      (line.match(/[0-9]\.\) .*/g) ? line.substring(4) : line)
        .replace(/\s+/g, ' ')
        .trim(),
    )
}
