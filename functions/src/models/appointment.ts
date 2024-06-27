
type AppointmentStatus = 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled' | 'noshow' | 'entered-in-error' | 'checked-in' | 'waitlist'

interface Appointment {
    status: AppointmentStatus
    created: Date
    start: Date
    end: Date
    comment?: string
    patientInstruction?: string
    participant: string[]
}