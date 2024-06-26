interface HealthSummaryData {
  name: string
  dateOfBirth: Date
  provider: string
  nextAppointment: Date
  medicationRequests: MedicationRequest[]
  vitals: Vitals
  symptomScores: SymptomScore[]
}
