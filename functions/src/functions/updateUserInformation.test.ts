//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { UserType } from "@stanfordbdhg/engagehf-models";
import { updateUserInformation } from "./updateUserInformation.js";
import { describeWithEmulators } from "../tests/functions/testEnvironment.js";
import { expectError } from "../tests/helpers.js";

describeWithEmulators("function: updateUserInformation", (env) => {
  it("updates user information successfully", async () => {
    const authUser = await env.auth.createUser({});

    await env.call(
      updateUserInformation,
      {
        userId: authUser.uid,
        data: {
          auth: {
            displayName: "Test User",
          },
        },
      },
      { uid: authUser.uid },
    );

    const updatedUser = await env.auth.getUser(authUser.uid);
    expect(updatedUser.displayName).toBe("Test User");
  });

  it("should not allow updating user without Firestore user doc", async () => {
    const authUser = await env.auth.createUser({});

    const callerId = await env.createUser({
      type: UserType.owner,
      organization: "stanford",
    });

    await expectError(
      () =>
        env.call(
          updateUserInformation,
          {
            userId: authUser.uid,
            data: {
              auth: {
                displayName: "Hacked",
              },
            },
          },
          {
            uid: callerId,
            token: { type: UserType.owner, organization: "stanford" },
          },
        ),
      (error) =>
        expect(error).toHaveProperty(
          "message",
          "User does not have permission.",
        ),
    );
  });

  it("should not allow clinician to update a non-patient user", async () => {
    const userId = await env.createUser({
      type: UserType.clinician,
      organization: "stanford",
    });

    const callerId = await env.createUser({
      type: UserType.clinician,
      organization: "stanford",
    });

    await expectError(
      () =>
        env.call(
          updateUserInformation,
          {
            userId: userId,
            data: {
              auth: {
                displayName: "Hacked",
              },
            },
          },
          {
            uid: callerId,
            token: { type: UserType.clinician, organization: "stanford" },
          },
        ),
      (error) =>
        expect(error).toHaveProperty(
          "message",
          "User does not have permission.",
        ),
    );
  });

  it("should not allow updating user with claims of other organization", async () => {
    const userId = await env.createUser({
      type: UserType.patient,
      organization: "stanford",
    });

    const callerId = await env.createUser({
      type: UserType.owner,
      organization: "other",
    });

    await expectError(
      () =>
        env.call(
          updateUserInformation,
          {
            userId: userId,
            data: {
              auth: {
                displayName: "Hacked",
              },
            },
          },
          {
            uid: callerId,
            token: { type: UserType.owner, organization: "other" },
          },
        ),
      (error) =>
        expect(error).toHaveProperty(
          "message",
          "User does not have permission.",
        ),
    );
  });
});
