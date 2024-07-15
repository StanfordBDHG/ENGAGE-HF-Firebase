import { type MedicationRecommendationCategory } from './medicationRecommendation.js'
import { type SymptomScores } from './symptomScores.js'

export interface HealthSummaryData {
  name: string
  dateOfBirth?: Date
  clinicianName: string
  nextAppointment?: Date
  medications: MedicationOptimization[]
  vitals: Vitals
  symptomScores: SymptomScores[]
}

export interface MedicationOptimization {
  name: string
  dose: string
  targetDose: string
  potentialPositiveChange: string
  category: MedicationRecommendationCategory
}

export interface Vitals {
  systolicBloodPressure: Observation[]
  diastolicBloodPressure: Observation[]
  heartRate: Observation[]
  bodyWeight: Observation[]
  dryWeight?: Observation
}

export interface Observation {
  date: Date
  value: number
}
