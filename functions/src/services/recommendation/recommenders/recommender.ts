//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { median } from '../../../extensions/array.js'
import { type FHIRAllergyIntolerance } from '../../../models/fhir/allergyIntolerance.js'
import { type MedicationRecommendationType } from '../../../models/medicationRecommendation.js'
import { type MedicationRequestContext } from '../../../models/medicationRequestContext.js'
import { type SymptomScore } from '../../../models/symptomScore.js'
import { type Vitals, type Observation } from '../../../models/vitals.js'
import {
  type MedicationClassReference,
  type MedicationReference,
} from '../../codes.js'
import { type ContraindicationService } from '../../contraindication/contraindicationService.js'
import { type FhirService } from '../../fhir/fhirService.js'

export interface RecommendationInput {
  requests: MedicationRequestContext[]
  contraindications: FHIRAllergyIntolerance[]
  vitals: Vitals
  latestSymptomScore?: SymptomScore
}

export interface RecommendationOutput {
  currentMedication: MedicationRequestContext[]
  recommendedMedication?: MedicationReference
  type: MedicationRecommendationType
}

export abstract class Recommender {
  // Properties

  protected readonly contraindicationService: ContraindicationService
  protected readonly fhirService: FhirService

  // Constructor

  constructor(
    contraindicationService: ContraindicationService,
    fhirService: FhirService,
  ) {
    this.contraindicationService = contraindicationService
    this.fhirService = fhirService
  }

  // Methods

  abstract compute(input: RecommendationInput): RecommendationOutput[]

  // Helpers

  protected createRecommendation(
    currentMedication: MedicationRequestContext[],
    recommendedMedication: MedicationReference | undefined,
    type: MedicationRecommendationType,
  ): RecommendationOutput[] {
    return [
      {
        currentMedication: currentMedication,
        recommendedMedication: recommendedMedication,
        type: type,
      },
    ]
  }

  protected isTargetDailyDoseReached(
    currentMedication: MedicationRequestContext[],
  ): boolean {
    const medication = currentMedication.at(0)?.medication
    if (!medication) throw new Error('Medication is missing')

    const targetDailyDose = this.fhirService
      .targetDailyDose(medication)
      ?.reduce((acc, dose) => acc + dose, 0)
    if (!targetDailyDose) throw new Error('Target daily dose is missing')

    const currentDailyDose = this.fhirService
      .currentDailyDose(currentMedication)
      .reduce((acc, dose) => acc + dose, 0)

    return currentDailyDose >= targetDailyDose
  }

  protected findCurrentRequests(
    requests: MedicationRequestContext[],
    references: MedicationClassReference[],
  ): MedicationRequestContext[] {
    return requests.filter((request) =>
      references.some(
        (reference) =>
          request.medicationClassReference.reference === reference.toString(),
      ),
    )
  }

  protected medianValue(observations: Observation[]): number | undefined {
    if (observations.length < 3) return undefined
    return median(observations.map((observation) => observation.value)) ?? 0
  }

  protected observationsInLastTwoWeeks(
    observations: Observation[],
  ): Observation[] {
    const twoWeeksAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 14
    return observations.filter(
      (observation) => observation.date.getTime() >= twoWeeksAgo,
    )
  }
}
