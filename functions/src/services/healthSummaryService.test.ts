//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import { FhirService } from './fhir/fhirService.js'
import { HealthSummaryService } from './healthSummaryService.js'
import { mockHealthSummaryData } from '../tests/mocks/healthSummaryData.js'
import { MockDatabaseService } from '../tests/mocks/mockDatabaseService.js'
import { TestFlags } from '../tests/testFlags.js'

describe('HealthSummaryService', () => {
  const healthSummaryService = new HealthSummaryService(
    new MockDatabaseService(),
    new FhirService(),
  )

  if (TestFlags.forceRunDisabledTests) {
    // TODO: Currently this test is disabled because it fails due to the dryWeight not being set correctly.
    // The dryWeight is not set correctly because it should be retrieved from the patients/$userId$/dryBodyWeightObservations collection
    // but it has not been implemented yet.
    it('should fetch health summary data', async () => {
      const actualData =
        await healthSummaryService.fetchHealthSummaryData('mockUser')
      const expectedData = mockHealthSummaryData()
      // TODO: Remove the next line to check whether medication optimizations also match the expected value.
      expectedData.medications = []
      expect(actualData).to.deep.equal(expectedData)
    })
  }
})
