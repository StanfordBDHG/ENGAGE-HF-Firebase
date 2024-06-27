// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface HealthSummaryData {
  name: string
  dateOfBirth?: Date
  clinicianName: string
  nextAppointment?: Date
  medicationRequests: MedicationRequest[]
  vitals: Vitals
  symptomScores: KccqScore[]
}
