//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import { DefaultHealthSummaryService } from './databaseHealthSummaryService.js'
import { type HealthSummaryService } from './healthSummaryService.js'
import { mockHealthSummaryData } from '../../tests/mocks/healthSummaryData.js'
import { MockPatientService } from '../patient/patientService.mock.js'
import { MockUserService } from '../user/userService.mock.js'

describe('HealthSummaryService', () => {
  const healthSummaryService: HealthSummaryService =
    new DefaultHealthSummaryService(
      new MockPatientService(),
      new MockUserService(),
    )

  it('should fetch health summary data', async () => {
    const actualData =
      await healthSummaryService.getHealthSummaryData('mockUser')
    const expectedData = await mockHealthSummaryData()
    // TODO: Remove the next line to check whether medication optimizations also match the expected value.
    expectedData.recommendations = []
    expect(actualData).to.deep.equal(expectedData)
  })
})
