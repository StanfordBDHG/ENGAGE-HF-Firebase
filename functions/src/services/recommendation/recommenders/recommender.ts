//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { median } from '../../../extensions/array.js'
import { FHIRMedicationRequest } from '../../../models/fhir/baseTypes/fhirElement.js'
import { type MedicationRequestContext } from '../../../models/medicationRequestContext.js'
import { type UserMedicationRecommendationType } from '../../../models/types/userMedicationRecommendation.js'
import { type Observation } from '../../../models/vitals.js'
import { type ContraindicationService } from '../../contraindication/contraindicationService.js'
import {
  type MedicationClassReference,
  type MedicationReference,
} from '../../references.js'
import {
  type RecommendationInput,
  type RecommendationOutput,
} from '../recommendationService.js'

export abstract class Recommender {
  // Properties

  protected readonly contraindicationService: ContraindicationService

  // Constructor

  constructor(contraindicationService: ContraindicationService) {
    this.contraindicationService = contraindicationService
  }

  // Methods

  abstract compute(input: RecommendationInput): RecommendationOutput[]

  // Helpers

  protected createRecommendation(
    currentMedication: MedicationRequestContext[],
    recommendedMedication: MedicationReference | undefined,
    type: UserMedicationRecommendationType,
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
    // TODO: Make sure that there is only one medication involved!
    const medication = currentMedication.at(0)?.medication
    if (!medication) throw new Error('Medication is missing')

    const targetDailyDose = medication.targetDailyDose?.reduce(
      (acc, dose) => acc + dose,
      0,
    )
    if (!targetDailyDose) throw new Error('Target daily dose is missing')

    const currentDailyDose = FHIRMedicationRequest.currentDailyDose(
      currentMedication,
    ).reduce((acc, dose) => acc + dose, 0)

    console.log('currentDailyDose', currentDailyDose)
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
}
