//
// This source file is part of the ENGAGE-HF Firebase open-source project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  registerDeviceInputSchema,
  type RegisterDeviceOutput,
} from "@schmiedmayerlab/engagehf-models";
import { validatedOnCall } from "./helpers.js";
import { getServiceFactory } from "../services/factory/getServiceFactory.js";

export const registerDevice = validatedOnCall(
  "registerDevice",
  registerDeviceInputSchema,
  async (request): Promise<RegisterDeviceOutput> => {
    const factory = getServiceFactory();
    const credential = factory.credential(request.auth);
    await factory.message().registerDevice(credential.userId, request.data);
  },
);
