//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { Appointment } from 'fhir/r4b.js'
import { FHIRResource } from './fhirResource.js'
import { AppointmentStatus } from '@stanfordspezi/spezi-firebase-fhir'
import { compactMap } from '../helpers/array.js'
import { FHIRExtensionUrl } from '../codes/codes.js'

export class FHIRAppointment extends FHIRResource<Appointment> {
  // Static Functions

  static create(input: {
    userId: string
    created: Date
    status?: AppointmentStatus
    start: Date
    durationInMinutes: number
  }): FHIRAppointment {
    return new FHIRAppointment({
      resourceType: 'Appointment',
      status: input.status ?? 'booked',
      created: input.created.toISOString(),
      start: input.start.toISOString(),
      end: new Date(
        input.start.getTime() + input.durationInMinutes * 60 * 1000,
      ).toISOString(),
      participant: [
        {
          status: 'accepted',
          actor: {
            reference: `users/${input.userId}`,
          },
        },
      ],
    })
  }

  // Computed Properties

  get startDate(): Date | undefined {
    return this.data.start ? new Date(this.data.start) : undefined
  }

  set startDate(date: Date) {
    this.data.start = date.toISOString()
  }

  get endDate(): Date | undefined {
    return this.data.end ? new Date(this.data.end) : undefined
  }

  set endDate(date: Date) {
    this.data.end = date.toISOString()
  }

  get providerNames(): string[] {
    return compactMap(
      this.extensionsWithUrl(FHIRExtensionUrl.providerName),
      (extension) => extension.valueString,
    )
  }
}
