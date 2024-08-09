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
import {
  type RecommendationInput,
  type RecommendationOutput,
  type Recommender,
} from './recommenders/recommender.js'
import { Sglt2iRecommender } from './recommenders/sglt2iRecommender.js'
import {
  type FHIRMedication,
  type FHIRMedicationRequest,
} from '../../models/fhir/medication.js'
import { type LocalizedText } from '../../models/helpers.js'
import {
  type MedicationRecommendationDoseSchedule,
  MedicationRecommendationType,
  type MedicationRecommendation,
} from '../../models/medicationRecommendation.js'
import { type ContraindicationService } from '../contraindication/contraindicationService.js'
import { type FhirService } from '../fhir/fhirService.js'
import { type MedicationService } from '../medication/medicationService.js'

export class RecommendationService {
  // Properties

  private readonly fhirService: FhirService
  private readonly medicationService: MedicationService
  private readonly recommenders: Recommender[]

  // Constructor

  constructor(
    contraindicationService: ContraindicationService,
    fhirService: FhirService,
    medicationService: MedicationService,
  ) {
    this.fhirService = fhirService
    this.medicationService = medicationService
    this.recommenders = [
      new BetaBlockerRecommender(contraindicationService, fhirService),
      new RasiRecommender(contraindicationService, fhirService),
      new Sglt2iRecommender(contraindicationService, fhirService),
      new MraRecommender(contraindicationService, fhirService),
      new DiureticRecommender(contraindicationService, fhirService),
    ]
  }

  // Methods

  async compute(
    input: RecommendationInput,
  ): Promise<MedicationRecommendation[]> {
    const result: MedicationRecommendation[] = []
    for (const recommender of this.recommenders) {
      const outputs = recommender.compute(input)
      for (const output of outputs) {
        result.push(await this.createRecommendation(output))
      }
    }
    return result
  }

  // Helpers

  private async createRecommendation(
    output: RecommendationOutput,
  ): Promise<MedicationRecommendation> {
    const recommendedMedication =
      output.recommendedMedication ?
        await this.medicationService.getReference({
          reference: output.recommendedMedication,
        })
      : undefined

    const medication =
      output.currentMedication.at(0)?.medication ??
      recommendedMedication?.content
    const title =
      medication ? this.fhirService.displayName(medication) : undefined
    const subtitle =
      output.currentMedication.at(0)?.medicationClass.name ??
      (() => {
        const recommendedMedicationContent = recommendedMedication?.content
        const reference =
          recommendedMedicationContent ?
            this.fhirService.medicationClassReference(
              recommendedMedicationContent,
            )
          : undefined
        return reference ? reference.display : undefined
      })()

    const minimumDailyDoseRequest =
      medication ?
        this.fhirService.minimumDailyDoseRequest(medication)
      : undefined
    const minimumDailyDoseDrugReference =
      minimumDailyDoseRequest?.medicationReference ?
        (
          await this.medicationService.getReference(
            minimumDailyDoseRequest.medicationReference,
          )
        )?.content
      : undefined
    const minimumDailyDoseSchedule =
      minimumDailyDoseRequest && minimumDailyDoseDrugReference ?
        this.doseSchedule(
          minimumDailyDoseRequest,
          minimumDailyDoseDrugReference,
        )
      : []

    const currentDailyDoseSchedule = output.currentMedication.flatMap(
      (context) => this.doseSchedule(context.request, context.drug),
    )

    const targetDailyDoseRequest =
      medication ?
        this.fhirService.targetDailyDoseRequest(medication)
      : undefined
    const targetDailyDoseDrugReference =
      targetDailyDoseRequest?.medicationReference ?
        (
          await this.medicationService.getReference(
            targetDailyDoseRequest.medicationReference,
          )
        )?.content
      : undefined
    const targetDailyDoseSchedule =
      targetDailyDoseRequest && targetDailyDoseDrugReference ?
        this.doseSchedule(targetDailyDoseRequest, targetDailyDoseDrugReference)
      : []

    return {
      currentMedication: output.currentMedication.map(
        (context) => context.requestReference,
      ),
      recommendedMedication:
        output.recommendedMedication ?
          {
            reference: output.recommendedMedication,
            display:
              recommendedMedication?.content ?
                this.fhirService.displayName(recommendedMedication.content)
              : undefined,
          }
        : null,
      displayInformation: {
        title: title ?? '',
        subtitle: subtitle ?? '',
        description: this.recommendationDescription(
          output,
          recommendedMedication?.content ?? null,
        ),
        type: output.type,
        dosageInformation: {
          minimumSchedule: minimumDailyDoseSchedule,
          currentSchedule: currentDailyDoseSchedule,
          targetSchedule: targetDailyDoseSchedule,
          unit: 'mg',
        },
      },
    }
  }

  private doseSchedule(
    request: FHIRMedicationRequest,
    drug: FHIRMedication,
  ): MedicationRecommendationDoseSchedule[] {
    const ingredients = (drug.ingredient ?? []).map(
      (ingredient) => ingredient.strength?.numerator?.value ?? 0,
    )
    return (request.dosageInstruction ?? []).map((instruction) => {
      const frequency = instruction.timing?.repeat?.frequency ?? 1
      const count = (instruction.doseAndRate ?? []).reduce(
        (previous, current) => previous + (current.doseQuantity?.value ?? 0),
        0,
      )
      return { frequency: frequency * count, quantity: ingredients }
    })
  }

  private recommendationDescription(
    output: RecommendationOutput,
    recommendedMedication: FHIRMedication | null,
  ): LocalizedText {
    switch (output.type) {
      case MedicationRecommendationType.improvementAvailable:
        if (recommendedMedication) {
          const displayName = this.fhirService.displayName(
            recommendedMedication,
          )
          return {
            en: `Switch to ${displayName} (More effective medication)`,
          }
        } else {
          return {
            en: 'Uptitrate',
          }
        }
      case MedicationRecommendationType.moreLabObservationsRequired:
        return {
          en: 'Wait for appointment',
        }
      case MedicationRecommendationType.morePatientObservationsRequired:
        return {
          en: 'Measure blood pressure',
        }
      case MedicationRecommendationType.noActionRequired:
        return {
          en: 'No action required',
        }
      case MedicationRecommendationType.notStarted:
        return {
          en: 'Start medication',
        }
      case MedicationRecommendationType.personalTargetDoseReached:
        return {
          en: 'Continue dose (personal goal reached)',
        }
      case MedicationRecommendationType.targetDoseReached:
        return {
          en: 'Continue dose',
        }
    }
  }
}
