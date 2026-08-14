//
// This source file is part of the ENGAGE-HF Firebase open-source project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from "zod";

export const deleteUserInputSchema = z.object({
  userId: z.string(),
});
export type DeleteUserInput = z.input<typeof deleteUserInputSchema>;

// eslint-disable-next-line sonarjs/redundant-type-aliases -- The named output type is part of the callable function contract.
export type DeleteUserOutput = undefined;
