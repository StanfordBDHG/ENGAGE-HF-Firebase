

interface MedicationRequest {
  name: string,
  dose: string,
  targetDose: string,
  potentialPositiveChange: string,
  category: 'targetDoseReached' | 'improvementAvailable' | 'notStarted',
}

interface Medication {
  name: string
  dose: string
  targetDose: string
}
