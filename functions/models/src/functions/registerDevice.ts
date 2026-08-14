//
// This source file is part of the ENGAGE-HF Firebase open-source project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type z } from "zod";
import { userDeviceConverter } from "../types/userDevice.js";

export const registerDeviceInputSchema = userDeviceConverter.value.schema;
export type RegisterDeviceInput = z.input<typeof registerDeviceInputSchema>;

// eslint-disable-next-line sonarjs/redundant-type-aliases -- The named output type is part of the callable function contract.
export type RegisterDeviceOutput = undefined;
