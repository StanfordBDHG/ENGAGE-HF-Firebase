//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type FHIRSimpleQuantity } from './fhir/baseTypes'

export interface Vitals {
  systolicBloodPressure: Observation[]
  diastolicBloodPressure: Observation[]
  heartRate: Observation[]
  bodyWeight: Observation[]

  estimatedGlomerularFiltrationRate?: Observation
  potassium?: Observation
  creatinine?: Observation
  dryWeight?: Observation
}

export interface Observation {
  date: Date
  value: number
}

export interface QuantityObservation {
  date: Date
  valueQuantity: FHIRSimpleQuantity
}
