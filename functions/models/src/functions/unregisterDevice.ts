//
// This source file is part of the ENGAGE-HF Firebase open-source project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from "zod";
import { UserDevicePlatform } from "../types/userDevice.js";

export const unregisterDeviceInputSchema = z.object({
  notificationToken: z.string(),
  platform: z.nativeEnum(UserDevicePlatform),
});
export type UnregisterDeviceInput = z.input<typeof unregisterDeviceInputSchema>;

// eslint-disable-next-line sonarjs/redundant-type-aliases -- The named output type is part of the callable function contract.
export type UnregisterDeviceOutput = undefined;
