//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  updateUserInformationInputSchema,
  type UpdateUserInformationOutput,
  UserType,
} from "@stanfordbdhg/engagehf-models";
import { privilegedServiceAccount, validatedOnCall } from "./helpers.js";
import { UserRole } from "../services/credential/credential.js";
import { getServiceFactory } from "../services/factory/getServiceFactory.js";

export const updateUserInformation = validatedOnCall(
  "updateUserInformation",
  updateUserInformationInputSchema,
  async (request): Promise<UpdateUserInformationOutput> => {
    const factory = getServiceFactory();
    const credential = factory.credential(request.auth);
    const userService = factory.user();

    await credential.checkAsync(
      () => [UserRole.admin, UserRole.user(request.data.userId)],
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

    await userService.updateAuth(request.data.userId, request.data.data.auth);
  },
  {
    serviceAccount: privilegedServiceAccount,
  },
);
