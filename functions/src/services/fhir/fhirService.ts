import { type QuantityUnit } from './quantityUnit.js'
import { type Observation } from '../../healthSummary/vitals.js'
import { type FHIRReference } from '../../models/fhir/baseTypes.js'
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
    const string = request.extension?.find(
      (extension) =>
        extension.url === FHIRExtensionUrl.currentMedication.toString(),
    )?.valueString
    return string ? { reference: string } : undefined
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
      unit: QuantityUnit
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
        for (const component of observation.component ?? []) {
          const containsCode = component.code.coding?.find(
            (coding) =>
              coding.code === options.component?.code &&
              coding.system === options.component?.system,
          )
          if (!containsCode) continue
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
}
