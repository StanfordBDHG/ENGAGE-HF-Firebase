//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { exportDataInputSchema } from "@stanfordbdhg/engagehf-models";
import { validatedOnCall } from "./helpers.js";
import { UserRole } from "../services/credential/credential.js";
import { getServiceFactory } from "../services/factory/getServiceFactory.js";

export const exportData = validatedOnCall(
  "exportData",
  exportDataInputSchema,
  async (request) => {
    const factory = getServiceFactory();
    const credential = factory.credential(request.auth);
    const exportService = factory.export();
    const userService = factory.user();

    let buffer: Buffer;
    if (request.data.userId !== undefined) {
      const patient = await userService.getUser(request.data.userId);

      credential.check(
        UserRole.admin,
        ...(patient?.content.organization ?
          [UserRole.owner(patient.content.organization)]
        : []),
      );

      buffer = await exportService.exportPatientDataForUser(
        request.data.userId,
      );
    } else {
      const role = await credential.checkAsync(
        () => [UserRole.admin],
        async () => {
          const user = await userService.getUser(credential.userId);
          return user?.content.organization !== undefined ?
              [UserRole.owner(user.content.organization)]
            : [];
        },
      );

      if (role === UserRole.admin) {
        buffer = await exportService.exportPatientDataForAll();
      } else if (role.organization !== undefined) {
        buffer = await exportService.exportPatientDataForOrganization(
          role.organization,
        );
      } else {
        throw credential.permissionDeniedError();
      }
    }

    return {
      content: buffer.toString("base64"),
    };
  },
);
