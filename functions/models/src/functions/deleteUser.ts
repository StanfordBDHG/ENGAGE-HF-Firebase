//
// This source file is part of the Stanford ENGAGE-HF project
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

export type DeleteUserOutput = undefined;
