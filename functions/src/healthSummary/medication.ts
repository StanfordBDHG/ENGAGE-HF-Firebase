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
