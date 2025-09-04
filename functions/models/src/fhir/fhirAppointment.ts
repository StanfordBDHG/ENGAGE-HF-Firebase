//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  appointmentSchema,
  FhirAppointment as BaseFhirAppointment,
} from "@stanfordspezi/spezi-firebase-fhir";
import { type Appointment } from "fhir/r4b.js";
import { FHIRExtensionUrl } from "../codes/codes.js";
import { compactMap } from "../helpers/array.js";

export class FhirAppointment extends BaseFhirAppointment {
  // Static Properties

  static readonly schema = appointmentSchema.transform(
    (value) => new FhirAppointment(value),
  );

  // Static Functions

  static create(input: {
    userId: string;
    created: Date;
    status?: Appointment["status"];
    start: Date;
    durationInMinutes: number;
  }): FhirAppointment {
    return new FhirAppointment({
      resourceType: "Appointment",
      status: input.status ?? "booked",
      created: input.created.toISOString(),
      start: input.start.toISOString(),
      end: new Date(
        input.start.getTime() + input.durationInMinutes * 60 * 1000,
      ).toISOString(),
      participant: [
        {
          status: "accepted",
          actor: {
            reference: `users/${input.userId}`,
          },
        },
      ],
    });
  }

  static parse(value: unknown): FhirAppointment {
    return new FhirAppointment(appointmentSchema.parse(value));
  }

  // Computed Properties

  get providerNames(): string[] {
    return compactMap(
      this.extensionsWithUrl(FHIRExtensionUrl.providerName),
      (extension) => extension.valueString,
    );
  }
}
