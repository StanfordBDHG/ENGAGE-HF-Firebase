//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { QuantityUnit } from './quantityUnit.js'
import {
  type FHIRCoding,
  type FHIRCodeableConcept,
  type FHIRReference,
  type FHIRExtension,
  type FHIRElement,
} from '../../models/fhir/baseTypes.js'
import {
  type FHIRMedication,
  type FHIRMedicationRequest,
} from '../../models/fhir/medication.js'
import { type FHIRObservation } from '../../models/fhir/observation.js'
import { type MedicationRequestContext } from '../../models/medicationRequestContext.js'
import { type Observation } from '../../models/vitals.js'
import { CodingSystem, FHIRExtensionUrl } from '../codes.js'

export class FhirService {
  // Medications

  extractMedicationDisplayName(medication: FHIRMedication): string | undefined {
    return medication.code?.coding?.find(
      (coding) => coding.system === CodingSystem.rxNorm,
    )?.display
  }

  extractCurrentMedicationRequestReferenceForRecommendation(
    request: FHIRMedicationRequest,
  ): FHIRReference<FHIRMedicationRequest> | undefined {
    return this.findExtensions(request, FHIRExtensionUrl.currentMedication).at(
      0,
    )?.valueReference
  }

  extractMedicationClassReference(
    medication: FHIRMedication,
  ): FHIRReference<FHIRMedication> | undefined {
    return this.findExtensions(medication, FHIRExtensionUrl.medicationClass).at(
      0,
    )?.valueReference
  }

  extractCurrentDailyDose(
    context: MedicationRequestContext,
    ingredientFilter: FHIRCoding[],
  ): number {
    let totalDailyDose = 0

    const ingredientStrength = context.drug?.ingredient?.find((ingredient) =>
      this.containsCoding(ingredient.itemCodeableConcept, ingredientFilter),
    )?.strength
    const dosePerPill = QuantityUnit.mg.valueOf(ingredientStrength?.numerator)
    if (!dosePerPill)
      throw new Error('Invalid ingredient strength encountered.')

    for (const instruction of context.request.dosageInstruction ?? []) {
      const intakesPerDay = instruction.timing?.repeat?.timeOfDay?.length ?? 0
      for (const dose of instruction.doseAndRate ?? []) {
        const numberOfPills = dose.doseQuantity?.value
        if (!numberOfPills)
          throw new Error('Invalid dose quantity encountered.')
        totalDailyDose += numberOfPills * intakesPerDay * dosePerPill
      }
    }
    return totalDailyDose
  }

  extractMinimumDailyDose(
    medication: FHIRMedication,
  ): number | number[] | undefined {
    return this.findExtensions(
      medication,
      FHIRExtensionUrl.minimumDailyDose,
    ).at(0)?.valueQuantity?.value
  }

  extractTargetDailyDose(
    medication: FHIRMedication,
  ): number | number[] | undefined {
    return this.findExtensions(medication, FHIRExtensionUrl.targetDailyDose).at(
      0,
    )?.valueQuantity?.value
  }

  // Observations

  extractObservationValues(
    observations: FHIRObservation[],
    options: {
      unit: QuantityUnit
      component?: FHIRCoding
    } & FHIRCoding,
  ): Observation[] {
    const result: Observation[] = []
    for (const observation of observations) {
      if (!this.containsCoding(observation.code, [options])) continue
      const date =
        observation.effectiveDateTime ??
        observation.effectiveInstant ??
        observation.effectivePeriod?.start ??
        observation.effectivePeriod?.end
      if (!date) continue

      if (options.component) {
        for (const component of observation.component ?? []) {
          if (!this.containsCoding(component.code, [options.component]))
            continue
          const value = options.unit.valueOf(component.valueQuantity)
          if (!value) continue
          result.push({ date: date, value: value, unit: options.unit })
        }
      } else {
        const value = options.unit.valueOf(observation.valueQuantity)
        if (!value) continue
        result.push({ date: date, value: value, unit: options.unit })
      }
    }
    return result
  }

  // CodeableConcept

  extractCodes(
    concept: FHIRCodeableConcept | undefined,
    filter: FHIRCoding,
  ): string[] {
    return (
      concept?.coding?.flatMap((coding) => {
        if (filter.system && coding.system !== filter.system) return []
        if (filter.version && coding.version !== filter.version) return []
        return coding.code ? [coding.code] : []
      }) ?? []
    )
  }

  containsCoding(
    concept: FHIRCodeableConcept | undefined,
    filter: FHIRCoding[],
  ): boolean {
    return filter.some(
      (filterCoding) =>
        concept?.coding?.some((coding) => {
          if (filterCoding.code && coding.code !== filterCoding.code)
            return false
          if (filterCoding.system && coding.system !== filterCoding.system)
            return false
          if (filterCoding.version && coding.version !== filterCoding.version)
            return false
          return true
        }) ?? false,
    )
  }

  // Extension

  findExtensions(element: FHIRElement, url: FHIRExtensionUrl): FHIRExtension[] {
    return (
      element.extension?.filter(
        (extension) => extension.url === url.toString(),
      ) ?? []
    )
  }
}
