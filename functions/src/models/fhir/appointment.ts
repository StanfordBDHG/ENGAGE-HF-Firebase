//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type FHIRCodeableConcept,
  type FHIRElement,
  type FHIRReference,
} from './baseTypes'
import { type User } from '../user'

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

export interface FHIRAppointment extends FHIRElement {
  status: AppointmentStatus
  created: string
  start: string
  end: string
  comment?: string
  patientInstruction?: string
  participant?: FHIRAppointmentParticipant[]
}

export interface FHIRAppointmentParticipant {
  actor?: FHIRReference<User>
  type?: FHIRCodeableConcept
}
