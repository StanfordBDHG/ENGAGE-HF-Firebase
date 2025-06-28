//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { QuantityUnit, UserSex } from '@stanfordbdhg/engagehf-models'
import { z } from 'zod'
import { EgfrCalculator } from './egfrCalculator.js'
import { readCsv } from '../../../tests/helpers/csv.js'

describe('EgfrCalculator', () => {
  const egfrCalculator = new EgfrCalculator()

  it('should calculate the same eGFR as the reference values', () => {
    readCsv('src/tests/resources/egfr.csv', 547, (line, index) => {
      if (index === 0) return // Skip header line

      const sexAssignedAtBirth = z.nativeEnum(UserSex).parse(line[0])
      const age = z.number().parse(parseFloat(line[1]))
      const creatinine = z.number().parse(parseFloat(line[2]))
      const expectedValue = z.number().parse(parseFloat(line[3]))

      const result = egfrCalculator.calculate({
        sexAssignedAtBirth,
        age,
        creatinine,
      })

      expect(result.unit).toBe(QuantityUnit.mL_min_173m2)
      expect(result.value).toBeCloseTo(expectedValue, 0)
    })
  })
})
