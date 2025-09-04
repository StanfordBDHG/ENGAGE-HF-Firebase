//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  FhirMedication as BaseFhirMedication,
  medicationSchema,
} from "@stanfordspezi/spezi-firebase-fhir";
import { type MedicationRequest, type Reference } from "fhir/r4b.js";
import { FhirMedicationRequest } from "./fhirMedicationRequest.js";
import { CodingSystem, FHIRExtensionUrl } from "../codes/codes.js";
import { QuantityUnit } from "../codes/quantityUnit.js";

export class FhirMedication extends BaseFhirMedication {
  // Static Properties

  static readonly schema = medicationSchema.transform(
    (value) => new FhirMedication(value),
  );

  // Static Functions

  static parse(value: unknown): FhirMedication {
    return new FhirMedication(medicationSchema.parse(value));
  }

  // Computed Properties

  get displayName(): string | undefined {
    return (
      this.value.code?.text ??
      this.value.code?.coding?.find(
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
    const requestResource = new FhirMedicationRequest(request);
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
    const requestResource = new FhirMedicationRequest(request);
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
    return this.value.code?.coding?.find(
      (coding) => coding.system === CodingSystem.rxNorm,
    )?.code;
  }
}
