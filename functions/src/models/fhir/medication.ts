//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type FHIRSimpleQuantity,
  type FHIRCodeableConcept,
  type FHIRElement,
  type FHIRRatio,
  type FHIRReference,
} from './baseTypes.js'

export interface FHIRMedication extends FHIRElement {
  code?: FHIRCodeableConcept
  form?: FHIRCodeableConcept
  ingredient?: FHIRMedicationIngredient[]
}

export interface FHIRMedicationIngredient {
  strength?: FHIRRatio
  itemCodeableConcept?: FHIRCodeableConcept
}

export interface FHIRMedicationRequest extends FHIRElement {
  medicationReference?: FHIRReference<FHIRMedication>
  dosageInstruction?: FHIRDosage[]
}

export interface FHIRDosage extends FHIRElement {
  text?: string
  patientInstruction?: string
  timing?: FHIRTiming
  doseAndRate?: FHIRDosageDoseAndRate[]
}

export interface FHIRDosageDoseAndRate extends FHIRElement {
  type?: FHIRCodeableConcept
  doseQuantity?: FHIRSimpleQuantity
  maxDosePerPeriod?: FHIRRatio
  maxDosePerAdministration?: FHIRSimpleQuantity
  maxDosePerLifetime?: FHIRSimpleQuantity
}

export interface FHIRTiming extends FHIRElement {
  repeat?: FHIRTimingRepeat
  code?: FHIRCodeableConcept
}

export interface FHIRTimingRepeat {
  frequency?: number
  period?: number
  periodUnit?: string
  timeOfDay?: string[]
}
