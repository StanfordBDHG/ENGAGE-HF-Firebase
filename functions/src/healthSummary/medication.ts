//
// This source file is part of the ENGAGE-HF based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

export enum MedicationOptimizationCategory {
  targetDoseReached = 'targetDoseReached',
  improvementAvailable = 'improvementAvailable',
  notStarted = 'notStarted',
}

export interface MedicationOptimization {
  name: string
  dose: string
  targetDose: string
  potentialPositiveChange: string
  category: MedicationOptimizationCategory
}
