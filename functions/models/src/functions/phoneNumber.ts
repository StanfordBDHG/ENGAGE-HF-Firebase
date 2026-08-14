//
// This source file is part of the ENGAGE-HF Firebase open-source project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from "zod";

const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/;
const codeRegex = /^\d{4,10}$/;

export const startPhoneNumberVerificationInputSchema = z.object({
  phoneNumber: z.string().regex(phoneNumberRegex),
});
export type StartPhoneNumberVerificationInput = z.input<
  typeof startPhoneNumberVerificationInputSchema
>;
// eslint-disable-next-line sonarjs/redundant-type-aliases -- The named output type is part of the callable function contract.
export type StartPhoneNumberVerificationOutput = undefined;

export const checkPhoneNumberVerificationInputSchema = z.object({
  phoneNumber: z.string().regex(phoneNumberRegex),
  code: z.string().regex(codeRegex),
});
export type CheckPhoneNumberVerificationInput = z.input<
  typeof checkPhoneNumberVerificationInputSchema
>;
// eslint-disable-next-line sonarjs/redundant-type-aliases -- The named output type is part of the callable function contract.
export type CheckPhoneNumberVerificationOutput = undefined;

export const deletePhoneNumberInputSchema = z.object({
  phoneNumber: z.string().regex(phoneNumberRegex),
});
export type DeletePhoneNumberInput = z.input<
  typeof deletePhoneNumberInputSchema
>;
// eslint-disable-next-line sonarjs/redundant-type-aliases -- The named output type is part of the callable function contract.
export type DeletePhoneNumberOutput = undefined;
