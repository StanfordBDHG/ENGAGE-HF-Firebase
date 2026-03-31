//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { onDocumentWritten } from "firebase-functions/firestore";
import { Env } from "../env.js";
import { getServiceFactory } from "../services/factory/getServiceFactory.js";
import { privilegedServiceAccount } from "./helpers.js";

export const onUserAllergyIntoleranceWritten = onDocumentWritten(
  {
    document: "users/{userId}/allergyIntolerances/{allergyIntoleranceId}",
    secrets: Env.twilioSecretKeys,
    serviceAccount: privilegedServiceAccount,
  },
  async (event) => {
    const factory = getServiceFactory();
    const triggerService = factory.trigger();
    await triggerService.updateRecommendationsForUser(event.params.userId);
  },
);
