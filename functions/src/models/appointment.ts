export enum AppointmentStatus {
  proposed = 'proposed',
  pending = 'pending',
  booked = 'booked',
  arrived = 'arrived',
  fulfilled = 'fulfilled',
  cancelled = 'cancelled',
  noshow = 'noshow',
  enterdInError = 'entered-in-error',
  checkedIn = 'checked-in',
  waitlist = 'waitlist',
}

export interface Appointment {
  status: AppointmentStatus
  created: Date
  start: Date
  end: Date
  comment?: string
  patientInstruction?: string
  participant: string[]
}
