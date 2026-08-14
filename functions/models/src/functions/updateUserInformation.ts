//
// This source file is part of the ENGAGE-HF Firebase open-source project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from "zod";
import { userAuthConverter } from "../types/userAuth.js";

export const updateUserInformationInputSchema = z.object({
  userId: z.string(),
  data: z.object({
    auth: z.lazy(() => userAuthConverter.value.schema),
  }),
});
export type UpdateUserInformationInput = z.input<
  typeof updateUserInformationInputSchema
>;

// eslint-disable-next-line sonarjs/redundant-type-aliases -- The named output type is part of the callable function contract.
export type UpdateUserInformationOutput = undefined;
