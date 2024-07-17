//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { BetaBlockerRecommender } from './recommenders/betaBlockerRecommender.js'
import { DiureticRecommender } from './recommenders/diureticRecommender.js'
import { MraRecommender } from './recommenders/mraRecommender.js'
import { RasiRecommender } from './recommenders/rasiRecommender.js'
import { type Recommender } from './recommenders/recommender.js'
import { Sglt2iRecommender } from './recommenders/sglt2iRecommender.js'
import { type FHIRAllergyIntolerance } from '../../models/fhir/allergyIntolerance.js'
import { type MedicationRecommendation } from '../../models/medicationRecommendation.js'
import { type MedicationRequestContext } from '../../models/medicationRequestContext.js'
import { type SymptomScores } from '../../models/symptomScores.js'
import { type Vitals } from '../../models/vitals.js'
import { type ContraindicationService } from '../contraindication/contraindicationService.js'
import { type FhirService } from '../fhir/fhirService.js'

export interface RecommendationInput {
  requests: MedicationRequestContext[]
  contraindications: FHIRAllergyIntolerance[]
  vitals: Vitals
  symptomScores?: SymptomScores
}

export class RecommendationService {
  // Properties

  private readonly recommenders: Recommender[]

  // Constructor

  constructor(
    contraindicationService: ContraindicationService,
    fhirService: FhirService,
  ) {
    this.recommenders = [
      new BetaBlockerRecommender(contraindicationService, fhirService),
      new RasiRecommender(contraindicationService, fhirService),
      new Sglt2iRecommender(contraindicationService, fhirService),
      new MraRecommender(contraindicationService, fhirService),
      new DiureticRecommender(contraindicationService, fhirService),
    ]
  }

  // Methods

  compute(input: RecommendationInput): MedicationRecommendation[] {
    return this.recommenders.flatMap((recommender) =>
      recommender.compute(input),
    )
  }
}
