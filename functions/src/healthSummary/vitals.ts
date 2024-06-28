export interface Vitals {
  systolicBloodPressure: Observation[]
  diastolicBloodPressure: Observation[]
  heartRate: Observation[]
  bodyWeight: Observation[]
  dryWeight: number
}

export interface Observation {
  date: Date
  value: number
}
