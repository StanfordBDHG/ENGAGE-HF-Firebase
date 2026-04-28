//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { UserObservationCollection } from "@stanfordbdhg/engagehf-models";
import { onDocumentWritten } from "firebase-functions/firestore";
import { Env } from "../env.js";
import { getServiceFactory } from "../services/factory/getServiceFactory.js";

export const onUserBloodPressureObservationWritten = onDocumentWritten(
  {
    document: "users/{userId}/bloodPressureObservations/{observationId}",
    secrets: Env.twilioSecretKeys,
  },
  async (event) => {
    const factory = getServiceFactory();
    const triggerService = factory.trigger();
    await triggerService.userObservationWritten(
      event.params.userId,
      UserObservationCollection.bloodPressure,
    );
  },
);
