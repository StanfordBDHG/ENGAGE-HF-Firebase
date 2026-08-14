//
// This source file is part of the ENGAGE-HF Firebase open-source project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from "zod";

export const deleteInvitationInputSchema = z.object({
  invitationCode: z.string(),
});
export type DeleteInvitationInput = z.input<typeof deleteInvitationInputSchema>;

// eslint-disable-next-line sonarjs/redundant-type-aliases -- The named output type is part of the callable function contract.
export type DeleteInvitationOutput = undefined;
