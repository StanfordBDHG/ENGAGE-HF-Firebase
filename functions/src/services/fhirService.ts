import {
  CodingSystem,
  FHIRExtensionUrl,
  type ObservationUnitCode,
} from './codes.js'
import { type Observation } from '../healthSummary/vitals.js'
import { type FHIRSimpleQuantity } from '../models/fhir/baseTypes.js'
import {
  type FHIRMedication,
  type FHIRMedicationRequest,
} from '../models/fhir/medication.js'
import { type FHIRObservation } from '../models/fhir/observation.js'

export class FhirService {
  // Medications

  extractMedicationDisplayName(medication: FHIRMedication): string | undefined {
    return medication.code?.coding?.find(
      (coding) => coding.system === CodingSystem.rxNorm,
    )?.display
  }

  extractCurrentMedicationRequestIdForRecommendation(
    request: FHIRMedicationRequest,
  ): string | undefined {
    return request.extension?.find(
      (extension) =>
        extension.url === FHIRExtensionUrl.currentMedication.toString(),
    )?.valueString
  }

  extractDailyDose(
    reference: string,
    requests: FHIRMedicationRequest[],
  ): FHIRSimpleQuantity[] {
    const result = new Map<string, number>()
    for (const request of requests) {
      if (request.medicationReference?.reference !== reference) continue
      for (const dosage of request.dosageInstruction ?? []) {
        for (const dose of dosage.doseAndRate ?? []) {
          const unit = dose.doseQuantity?.unit
          const value = dose.doseQuantity?.value
          if (!unit || !value) continue
          result.set(unit, (result.get(unit) ?? 0) + value)
        }
      }
    }
    return Array.from(result.entries()).map(([unit, value]) => ({
      value: value,
      unit: unit,
    }))
  }

  extractTargetDailyDose(
    medication: FHIRMedication,
  ): number | number[] | undefined {
    return medication.extension?.find(
      (extension) =>
        extension.url === FHIRExtensionUrl.targetDailyDose.toString(),
    )?.valueQuantity?.value
  }

  // Observations

  extractObservationValues(
    observations: FHIRObservation[],
    options: {
      code: string
      system: CodingSystem
      unit: ObservationUnitCode
      convert?: (value: number, unit: string) => number | undefined
      component?: {
        code: string
        system: CodingSystem
      }
    },
  ): Observation[] {
    const result: Observation[] = []
    for (const observation of observations) {
      const containsCode = observation.code.coding?.find(
        (coding) =>
          coding.code === options.code && coding.system === options.system,
      )
      if (!containsCode) continue
      const date =
        observation.effectiveDateTime ??
        observation.effectiveInstant ??
        observation.effectivePeriod?.start ??
        observation.effectivePeriod?.end
      if (!date) continue

      if (options.component) {
        for (const component of observation.component) {
          const containsCode = component.code.coding?.find(
            (coding) =>
              coding.code === options.component?.code &&
              coding.system === options.component?.system,
          )
          if (!containsCode) continue
          const value = this.extractQuantityValue(
            component.valueQuantity,
            options.unit,
            options.convert,
          )
          if (!value) continue
          result.push({ date: date, value: value })
        }
      } else {
        const value = this.extractQuantityValue(
          observation.valueQuantity,
          options.unit,
          options.convert,
        )
        if (!value) continue
        result.push({ date: date, value: value })
      }
    }
    return result
  }

  // Helpers

  private extractQuantityValue(
    quantity: FHIRSimpleQuantity | undefined,
    expectedUnit: ObservationUnitCode,
    convert?: (value: number, unit: string) => number | undefined,
  ): number | undefined {
    if (!quantity?.code || !quantity.value) return undefined
    if (quantity.code !== expectedUnit.toString()) {
      return convert ? convert(quantity.value, quantity.code) : undefined
    }
    return quantity.value
  }
}
