//
// This source file is part of the ENGAGE-HF based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { type QuantityUnit } from './quantityUnit.js'
import { type Observation } from '../../healthSummary/vitals.js'
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
    const string = this.findExtensions(
      request,
      FHIRExtensionUrl.currentMedication,
    ).at(0)?.valueString
    return string ? { reference: string } : undefined
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
      if (!this.containsCoding(observation.code, options)) continue
      const date =
        observation.effectiveDateTime ??
        observation.effectiveInstant ??
        observation.effectivePeriod?.start ??
        observation.effectivePeriod?.end
      if (!date) continue

      if (options.component) {
        for (const component of observation.component ?? []) {
          if (!this.containsCoding(component.code, options.component)) continue
          const value = options.unit.valueOf(component.valueQuantity)
          if (!value) continue
          result.push({ date: date, value: value })
        }
      } else {
        const value = options.unit.valueOf(observation.valueQuantity)
        if (!value) continue
        result.push({ date: date, value: value })
      }
    }
    return result
  }

  // CodeableConcept

  containsCoding(concept: FHIRCodeableConcept, filter: FHIRCoding): boolean {
    return (
      concept.coding?.some((coding) => {
        if (filter.code && coding.code !== filter.code) return false
        if (filter.system && coding.system !== filter.system) return false
        if (filter.version && coding.version !== filter.version) return false
        return true
      }) ?? false
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
