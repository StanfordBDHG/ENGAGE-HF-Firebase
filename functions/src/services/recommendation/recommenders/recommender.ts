//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { median } from '../../../extensions/array.js'
import {
  type MedicationRecommendationCategory,
  type MedicationRecommendation,
} from '../../../models/medicationRecommendation.js'
import { type MedicationRequestContext } from '../../../models/medicationRequestContext.js'
import { type Observation } from '../../../models/vitals.js'
import {
  type MedicationClassReference,
  type MedicationReference,
} from '../../codes.js'
import { type ContraindicationService } from '../../contraindication/contraindicationService.js'
import { type FhirService } from '../../fhir/fhirService.js'
import { type RecommendationInput } from '../recommendationService.js'

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

  abstract compute(input: RecommendationInput): MedicationRecommendation[]

  // Helpers

  protected createRecommendation(
    currentMedication: MedicationRequestContext | undefined,
    recommendedMedication: MedicationReference | undefined,
    category: MedicationRecommendationCategory,
  ): MedicationRecommendation[] {
    return [
      {
        currentMedication: currentMedication?.requestReference,
        recommendedMedication:
          recommendedMedication ?
            {
              reference: recommendedMedication,
            }
          : undefined,
        category,
      },
    ]
  }

  protected isTargetDoseReached(
    currentMedication: MedicationRequestContext,
  ): boolean {
    if (!currentMedication.medication) throw new Error('Medication is missing')
    const ingredients = currentMedication.medication.ingredient ?? []
    const targetDailyDose = this.fhirService.extractTargetDailyDose(
      currentMedication.medication,
    )
    if (!targetDailyDose) throw new Error('Target daily dose is missing')

    ingredients.forEach((ingredient, index) => {
      if (!ingredient.itemCodeableConcept)
        throw new Error('Ingredient coding is missing')

      const currentIngredientDose = this.fhirService.extractCurrentDailyDose(
        currentMedication,
        ingredient.itemCodeableConcept.coding ?? [],
      )
      if (currentIngredientDose <= 0)
        throw new Error('Current daily dose is missing')

      const targetIngredientDose =
        Array.isArray(targetDailyDose) ?
          targetDailyDose[index]
        : targetDailyDose
      if (currentIngredientDose < targetIngredientDose) return false
    })
    return true
  }

  protected findCurrentMedication(
    requests: MedicationRequestContext[],
    medicationReferences: MedicationClassReference[],
  ): MedicationRequestContext | undefined {
    return requests.find((request) =>
      medicationReferences.some(
        (medicationReference) =>
          request.medicationClassReference?.reference === medicationReference,
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
