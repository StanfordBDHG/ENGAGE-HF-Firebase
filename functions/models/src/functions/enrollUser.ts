//
// This source file is part of the ENGAGE-HF Firebase open-source project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from "zod";

export const enrollUserInputSchema = z.object({
  invitationCode: z.string().regex(/^[A-Z0-9]{8,16}$/),
});
export type EnrollUserInputSchema = z.input<typeof enrollUserInputSchema>;

// eslint-disable-next-line sonarjs/redundant-type-aliases -- The named output type is part of the callable function contract.
export type EnrollUserOutputSchema = undefined;
