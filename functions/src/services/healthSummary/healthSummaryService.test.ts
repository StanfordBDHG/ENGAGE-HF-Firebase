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
import { MockAuthService } from '../auth/mockAuthService.js'
import { FhirService } from '../fhir/fhirService.js'
import { MockPatientService } from '../patient/mockPatientService.js'
import { MockUserService } from '../user/mockUserService.js'

describe('HealthSummaryService', () => {
  const healthSummaryService: HealthSummaryService =
    new DefaultHealthSummaryService(
      new MockAuthService(),
      new FhirService(),
      new MockPatientService(),
      new MockUserService(),
    )

  it('should fetch health summary data', async () => {
    const actualData =
      await healthSummaryService.getHealthSummaryData('mockUser')
    const expectedData = await mockHealthSummaryData()
    // TODO: Remove the next line to check whether medication optimizations also match the expected value.
    expectedData.medications = []
    expect(actualData).to.deep.equal(expectedData)
  })
})
