export enum MedicationRequestCategory {
  targetDoseReached = 'targetDoseReached',
  improvementAvailable = 'improvementAvailable',
  notStarted = 'notStarted',
}

export interface MedicationRequest {
  name: string
  dose: string
  targetDose: string
  potentialPositiveChange: string
  category: MedicationRequestCategory
}

export interface Medication {
  name: string
  dose: string
  targetDose: string
}
