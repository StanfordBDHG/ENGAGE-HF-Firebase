//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { describe, it } from 'mocha'
import { BetaBlockerRecommender } from './betaBlockerRecommender.js'
import { MockContraindicationService } from '../../../tests/mocks/contraindicationService.js'
import { ContraindicationCategory } from '../../contraindication/contraindicationService.js'
import { FhirService } from '../../fhir/fhirService.js'

describe('DiureticRecommender', () => {
  const recommender = new BetaBlockerRecommender(
    new MockContraindicationService(
      () => ContraindicationCategory.none,
      () => ContraindicationCategory.none,
    ),
    new FhirService(),
  )

  it('correctly recommends no action required', () => {
    console.log(recommender)
  })
})
