//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  enableUserInputSchema,
  type EnableUserOutput,
  UserType,
} from "@stanfordbdhg/engagehf-models";
import { privilegedServiceAccount, validatedOnCall } from "./helpers.js";
import { UserRole } from "../services/credential/credential.js";
import { getServiceFactory } from "../services/factory/getServiceFactory.js";

export const enableUser = validatedOnCall(
  "enableUser",
  enableUserInputSchema,
  async (request): Promise<EnableUserOutput> => {
    const factory = getServiceFactory();
    const credential = factory.credential(request.auth);
    const userId = request.data.userId;
    const userService = factory.user();

    await credential.checkAsync(
      () => [UserRole.admin],
      async () => {
        const user = await userService.getUser(request.data.userId);
        if (user?.content.organization === undefined) return [];
        return [
          UserRole.owner(user.content.organization),
          user.content.type === UserType.patient ?
            UserRole.clinician(user.content.organization)
          : null,
        ];
      },
    );

    await userService.enableUser(userId);
  },
  {
    serviceAccount: privilegedServiceAccount,
  },
);
