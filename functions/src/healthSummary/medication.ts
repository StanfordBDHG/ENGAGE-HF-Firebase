// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface MedicationRequest {
  name: string
  dose: string
  targetDose: string
  potentialPositiveChange: string
  category: 'targetDoseReached' | 'improvementAvailable' | 'notStarted'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Medication {
  name: string
  dose: string
  targetDose: string
}
