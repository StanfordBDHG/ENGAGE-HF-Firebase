//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import assert from 'assert'
import fs from 'fs'
import { healthSummaryLocalization } from './generate+localizations.js'
import { generateSpeedometerSvg } from './generateSpeedometer.js'
import { Localizer } from '../services/localization/localizer.js'
import { mockHealthSummaryData } from '../tests/mocks/healthSummaryData.js'
import { TestFlags } from '../tests/testFlags.js'

describe('generateSpeedometer', () => {
  const enLocalizer = new Localizer(healthSummaryLocalization, ['en-US'])
  const esLocalizer = new Localizer(healthSummaryLocalization, ['es'])

  it('should generate the same chart on mock data (en)', async () => {
    const inputData = await mockHealthSummaryData('')
    const actualData = generateSpeedometerSvg(inputData.symptomScores, 258, {
      localizer: enLocalizer,
    })
    const expectedPath = 'src/tests/resources/mockSpeedometer-en.svg'
    if (TestFlags.regenerateValues) {
      fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      expect(actualData).toBe(expectedData.toString('utf8'))
    }
  })

  it('should generate the same chart on mock data (es)', async () => {
    const inputData = await mockHealthSummaryData('')
    const actualData = generateSpeedometerSvg(inputData.symptomScores, 258, {
      localizer: esLocalizer,
    })
    const expectedPath = 'src/tests/resources/mockSpeedometer-es.svg'
    if (TestFlags.regenerateValues) {
      fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      expect(actualData).toBe(expectedData.toString('utf8'))
    }
  })

  it('should generate an empty chart the same way (en)', () => {
    const actualData = generateSpeedometerSvg([], 258, {
      localizer: enLocalizer,
    })
    const expectedPath = 'src/tests/resources/emptySpeedometer-en.svg'
    if (TestFlags.regenerateValues) {
      fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      expect(actualData).toBe(expectedData.toString('utf8'))
    }
  })

  it('should generate an empty chart the same way (es)', () => {
    const actualData = generateSpeedometerSvg([], 258, {
      localizer: esLocalizer,
    })
    const expectedPath = 'src/tests/resources/emptySpeedometer-es.svg'
    if (TestFlags.regenerateValues) {
      fs.writeFileSync(expectedPath, actualData)
    } else {
      const expectedData = fs.readFileSync(expectedPath)
      expect(actualData).toBe(expectedData.toString('utf8'))
    }
  })
})
