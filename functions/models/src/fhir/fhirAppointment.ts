//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { Appointment } from 'fhir/r4b.js'
import { FHIRResource } from './fhirResource.js'
import { AppointmentStatus } from 'spezi-firebase-fhir'
import { compactMap } from '../helpers/array.js'
import { FHIRExtensionUrl } from '../codes/codes.js'

/*
import { z } from 'zod'
import { fhirCodeableConceptConverter } from './baseTypes/fhirCodeableConcept.js'
import {
  FHIRResource,
  fhirResourceConverter,
  type FHIRResourceInput,
} from './baseTypes/fhirElement.js'
import { fhirReferenceConverter } from './baseTypes/fhirReference.js'
import { FHIRExtensionUrl } from '../codes/codes.js'
import { compactMap } from '../helpers/array.js'
import { dateTimeConverter } from '../helpers/dateConverter.js'
import { Lazy } from '../helpers/lazy.js'
import { optionalish } from '../helpers/optionalish.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'

export enum FHIRAppointmentStatus {
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

export const fhirAppointmentParticipantConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: z.object({
        actor: optionalish(z.lazy(() => fhirReferenceConverter.value.schema)),
        type: optionalish(
          z.lazy(() => fhirCodeableConceptConverter.value.schema),
        ),
      }),
      encode: (object) => ({
        actor:
          object.actor ?
            fhirReferenceConverter.value.encode(object.actor)
          : null,
        type:
          object.type ?
            fhirCodeableConceptConverter.value.encode(object.type)
          : null,
      }),
    }),
)

export type FHIRAppointmentParticipant = z.output<
  typeof fhirAppointmentParticipantConverter.value.schema
>

export const fhirAppointmentConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: fhirResourceConverter.value.schema
        .extend({
          status: z.nativeEnum(FHIRAppointmentStatus),
          created: dateTimeConverter.schema,
          start: dateTimeConverter.schema,
          end: dateTimeConverter.schema,
          comment: optionalish(z.string()),
          patientInstruction: optionalish(z.string()),
          participant: optionalish(
            z
              .lazy(() => fhirAppointmentParticipantConverter.value.schema)
              .array(),
          ),
        })
        .transform((values) => new FHIRAppointment(values)),
      encode: (object) => ({
        ...fhirResourceConverter.value.encode(object),
        status: object.status,
        created: dateTimeConverter.encode(object.created),
        start: dateTimeConverter.encode(object.start),
        end: dateTimeConverter.encode(object.end),
        comment: object.comment ?? null,
        patientInstruction: object.patientInstruction ?? null,
        participant:
          object.participant?.map(
            fhirAppointmentParticipantConverter.value.encode,
          ) ?? null,
      }),
    }),
)
    */

export class FHIRAppointment extends FHIRResource<Appointment> {
  // Static Functions

  static create(input: {
    userId: string
    created: Date
    status: AppointmentStatus
    start: Date
    durationInMinutes: number
  }): FHIRAppointment {
    return new FHIRAppointment({
      resourceType: 'Appointment',
      status: input.status,
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

  get providerNames(): string[] {
    return compactMap(
      this.extensionsWithUrl(FHIRExtensionUrl.providerName),
      (extension) => extension.valueString,
    )
  }
}
