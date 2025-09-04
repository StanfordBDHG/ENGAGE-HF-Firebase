//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from "zod";
import {
  userRegistrationConverter,
  userRegistrationInputConverter,
  UserRegistration,
  type UserSex,
} from "./userRegistration.js";
import { type UserType } from "./userType.js";
import { dateTimeConverter } from "../helpers/dateConverter.js";
import { Lazy } from "../helpers/lazy.js";
import { optionalishDefault } from "../helpers/optionalish.js";
import { SchemaConverter } from "../helpers/schemaConverter.js";

export const userConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: userRegistrationInputConverter.value.schema
        .extend({
          dateOfEnrollment: dateTimeConverter.schema,
          invitationCode: z.string(),
          lastActiveDate: dateTimeConverter.schema,
          phoneNumbers: optionalishDefault(z.array(z.string()), []),
        })
        .transform((values) => new User(values)),
      encode: (object) => ({
        ...userRegistrationConverter.value.encode(object),
        lastActiveDate: dateTimeConverter.encode(object.lastActiveDate),
        dateOfEnrollment: dateTimeConverter.encode(object.dateOfEnrollment),
        invitationCode: object.invitationCode,
        phoneNumbers: object.phoneNumbers,
      }),
    }),
);

export class User extends UserRegistration {
  // Properties

  readonly dateOfEnrollment: Date;
  readonly invitationCode: string;
  readonly lastActiveDate: Date;
  readonly phoneNumbers: string[];

  // Constructor

  constructor(input: {
    type: UserType;
    disabled: boolean;
    selfManaged: boolean;
    organization?: string;
    dateOfBirth?: Date;
    sex?: UserSex;
    clinician?: string;
    receivesAppointmentReminders: boolean;
    receivesInactivityReminders: boolean;
    receivesMedicationUpdates: boolean;
    receivesQuestionnaireReminders: boolean;
    receivesRecommendationUpdates: boolean;
    receivesVitalsReminders: boolean;
    receivesWeightAlerts: boolean;
    language?: string;
    timeZone?: string;
    dateOfEnrollment: Date;
    invitationCode: string;
    lastActiveDate: Date;
    phoneNumbers: string[];
  }) {
    super(input);
    this.dateOfEnrollment = input.dateOfEnrollment;
    this.invitationCode = input.invitationCode;
    this.lastActiveDate = input.lastActiveDate;
    this.phoneNumbers = input.phoneNumbers;
  }
}
