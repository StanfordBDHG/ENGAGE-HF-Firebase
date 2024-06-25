interface HealthSummaryData {
  name: string
  dateOfBirth: Date
  provider: string
  nextAppointment: Date
  currentMedications: MedicationRequest[]
  proposedMedications: MedicationRequest[]
  vitals: Vitals
  symptomScores: SymptomScore[]
}
