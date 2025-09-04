//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type Medication,
  type MedicationRequest,
  type Reference,
} from "fhir/r4b.js";
import { FHIRMedicationRequest } from "./fhirMedicationRequest.js";
import { FHIRResource } from "./fhirResource.js";
import { CodingSystem, FHIRExtensionUrl } from "../codes/codes.js";
import { QuantityUnit } from "../codes/quantityUnit.js";

export class FHIRMedication extends FHIRResource<Medication> {
  // Computed Properties

  get displayName(): string | undefined {
    return (
      this.data.code?.text ??
      this.data.code?.coding?.find(
        (coding) => coding.system === CodingSystem.rxNorm,
      )?.display
    );
  }

  get brandNames(): string[] {
    return this.extensionsWithUrl(FHIRExtensionUrl.brandName).flatMap(
      (extension) => (extension.valueString ? [extension.valueString] : []),
    );
  }

  get medicationClassReference(): Reference | undefined {
    return this.extensionsWithUrl(FHIRExtensionUrl.medicationClass).at(0)
      ?.valueReference;
  }

  get minimumDailyDoseRequest(): MedicationRequest | undefined {
    const reference = this.extensionsWithUrl(
      FHIRExtensionUrl.minimumDailyDose,
    ).at(0)?.valueReference?.reference;
    if (!reference) return undefined;
    return this.containedResource<MedicationRequest>(reference.substring(1));
  }

  get minimumDailyDose(): number[] | undefined {
    const request = this.minimumDailyDoseRequest;
    if (!request) return undefined;
    const requestResource = new FHIRMedicationRequest(request);
    return requestResource
      .extensionsWithUrl(FHIRExtensionUrl.totalDailyDose)
      .map((extension) => extension.valueQuantity)
      .flatMap((quantity) => {
        const value = QuantityUnit.mg.valueOf(quantity);
        return value ? [value] : [];
      });
  }

  get targetDailyDoseRequest(): MedicationRequest | undefined {
    const reference = this.extensionsWithUrl(
      FHIRExtensionUrl.targetDailyDose,
    ).at(0)?.valueReference?.reference;
    if (!reference) return undefined;
    return this.containedResource<MedicationRequest>(reference.substring(1));
  }

  get targetDailyDose(): number[] | undefined {
    const request = this.targetDailyDoseRequest;
    if (!request) return undefined;
    const requestResource = new FHIRMedicationRequest(request);
    const result = requestResource
      .extensionsWithUrl(FHIRExtensionUrl.totalDailyDose)
      .map((extension) => extension.valueQuantity)
      .flatMap((quantity) => {
        const value = QuantityUnit.mg.valueOf(quantity);
        return value ? [value] : [];
      });
    return result;
  }

  get rxNormCode(): string | undefined {
    return this.data.code?.coding?.find(
      (coding) => coding.system === CodingSystem.rxNorm,
    )?.code;
  }
}
