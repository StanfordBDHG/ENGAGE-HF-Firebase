//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type Observation,
  type QuantityUnit,
} from '@stanfordbdhg/engagehf-models'
import { type HealthSummaryData } from '../../models/healthSummaryData.js'
import { type Vitals } from '../../models/vitals.js'

export interface HealthSummaryService {
  getHealthSummaryData(
    userId: string,
    weightUnit: QuantityUnit,
  ): Promise<HealthSummaryData>

  // Vitals

  getVitals(
    userId: string,
    cutoffDate: Date,
    weightUnit: QuantityUnit,
  ): Promise<Vitals>

  getBloodPressureObservations(
    userId: string,
    cutoffDate: Date,
  ): Promise<[Observation[], Observation[]]>

  getBodyWeightObservations(
    userId: string,
    cutoffDate: Date,
    unit: QuantityUnit,
  ): Promise<Observation[]>

  getHeartRateObservations(
    userId: string,
    cutoffDate: Date,
  ): Promise<Observation[]>

  getMostRecentCreatinineObservation(
    userId: string,
  ): Promise<Observation | undefined>

  getMostRecentDryWeightObservation(
    userId: string,
  ): Promise<Observation | undefined>

  getMostRecentEstimatedGlomerularFiltrationRateObservation(
    userId: string,
  ): Promise<Observation | undefined>

  getMostRecentPotassiumObservation(
    userId: string,
  ): Promise<Observation | undefined>
}
