//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  QuestionnaireReference,
  UserMessage,
  UserType,
} from "@stanfordbdhg/engagehf-models";
import { dismissMessage } from "./dismissMessage.js";
import { describeWithEmulators } from "../tests/functions/testEnvironment.js";
import { expectError } from "../tests/helpers.js";

describeWithEmulators("function: dismissMessage", (env) => {
  it("should fail dismissing a non-dismissible message", async () => {
    const user = await env.auth.createUser({});
    const message = UserMessage.createSymptomQuestionnaire({
      questionnaireReference: QuestionnaireReference.kccq_en_US,
    });
    const messageRef = env.collections.userMessages(user.uid).doc();
    await messageRef.set(message);

    await expectError(
      async () =>
        env.call(
          dismissMessage,
          { messageId: messageRef.id, didPerformAction: true },
          {
            uid: user.uid,
            token: { type: UserType.patient, organization: "stanford" },
          },
        ),
      (error) =>
        expect(error).toHaveProperty("message", "Message is not dismissible."),
    );
  });

  it("should dismiss a dismissible message", async () => {
    const user = await env.auth.createUser({});
    const message = UserMessage.createWeightGain();
    const messageRef = env.collections.userMessages(user.uid).doc();
    await messageRef.set(message);

    await env.call(
      dismissMessage,
      { messageId: messageRef.id, didPerformAction: true },
      {
        uid: user.uid,
        token: { type: UserType.patient, organization: "stanford" },
      },
    );

    const actualMessage = await messageRef.get();
    expect(actualMessage.exists).toBe(true);
    expect(actualMessage.data()?.completionDate).toBeDefined();
  });
});
