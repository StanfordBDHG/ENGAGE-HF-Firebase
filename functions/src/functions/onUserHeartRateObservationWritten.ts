//
// This source file is part of the Stanford ENGAGE-HF project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { UserObservationCollection } from "@schmiedmayerlab/engagehf-models";
import { onDocumentWritten } from "firebase-functions/firestore";
import { Env } from "../env.js";
import { getServiceFactory } from "../services/factory/getServiceFactory.js";

export const onUserHeartRateObservationWritten = onDocumentWritten(
  {
    document: "users/{userId}/heartRateObservations/{observationId}",
    secrets: Env.twilioSecretKeys,
  },
  async (event) => {
    const factory = getServiceFactory();
    const triggerService = factory.trigger();
    await triggerService.userObservationWritten(
      event.params.userId,
      UserObservationCollection.heartRate,
    );
  },
);
