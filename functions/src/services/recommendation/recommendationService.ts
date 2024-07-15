import { BetaBlockerRecommender } from './recommenders/betaBlockersRecommender.js'
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
    ]
  }

  // Methods

  compute(input: RecommendationInput): MedicationRecommendation[] {
    return this.recommenders.flatMap((recommender) =>
      recommender.compute(input),
    )
  }
}
