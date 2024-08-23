//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type Observation } from '@stanfordbdhg/engagehf-models'

export interface Vitals {
  systolicBloodPressure: Observation[]
  diastolicBloodPressure: Observation[]
  heartRate: Observation[]
  bodyWeight: Observation[]

  creatinine?: Observation
  dryWeight?: Observation
  estimatedGlomerularFiltrationRate?: Observation
  potassium?: Observation
}
