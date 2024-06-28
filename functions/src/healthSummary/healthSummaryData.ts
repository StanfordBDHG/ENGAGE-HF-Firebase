import { type MedicationRequest } from './medication'
import { type Vitals } from './vitals'
import { type KccqScore } from '../models/kccqScore'

export interface HealthSummaryData {
  name: string
  dateOfBirth?: Date
  clinicianName: string
  nextAppointment?: Date
  medicationRequests: MedicationRequest[]
  vitals: Vitals
  symptomScores: KccqScore[]
}
