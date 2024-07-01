import { type MedicationOptimization } from './medication.js'
import { type Vitals } from './vitals.js'
import { type KccqScore } from '../models/kccqScore.js'

export interface HealthSummaryData {
  name: string
  dateOfBirth?: Date
  clinicianName: string
  nextAppointment?: Date
  medications: MedicationOptimization[]
  vitals: Vitals
  symptomScores: KccqScore[]
}
