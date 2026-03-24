//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { UserType } from "@stanfordbdhg/engagehf-models";
import { enableUser } from "./enableUser.js";
import { describeWithEmulators } from "../tests/functions/testEnvironment.js";
import { expectError } from "../tests/helpers.js";

describeWithEmulators("function: enableUser", (env) => {
  it("enables a disabled user", async () => {
    const clinicianId = await env.createUser({
      type: UserType.clinician,
      organization: "stanford",
    });

    const userId = await env.createUser({
      type: UserType.patient,
      organization: "stanford",
      clinician: clinicianId,
      disabled: true,
    });

    const userService = env.factory.user();

    const originalUser = await userService.getUser(userId);
    expect(originalUser).toBeDefined();
    expect(originalUser?.content.claims.disabled).toBe(true);
    expect(originalUser?.content.disabled).toBe(true);

    await env.call(
      enableUser,
      { userId: userId },
      {
        uid: clinicianId,
        token: {
          type: UserType.clinician,
          organization: "stanford",
          disabled: false,
        },
      },
    );

    const user = await userService.getUser(userId);
    expect(user).toBeDefined();
    expect(user?.content.claims.disabled).toBe(false);
    expect(user?.content.disabled).toBe(false);
  });

  it("should not allow enabling user with claims of other organization", async () => {
    const userId = await env.createUser({
      type: UserType.patient,
      organization: "stanford",
      disabled: true,
    });

    const callerId = await env.createUser({
      type: UserType.owner,
      organization: "other",
    });

    await expectError(
      () =>
        env.call(
          enableUser,
          { userId: userId },
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

    const userService = env.factory.user();
    const user = await userService.getUser(userId);
    expect(user?.content.disabled).toBe(true);
  });

  it("should not allow enabling user without Firestore user doc", async () => {
    const authUser = await env.auth.createUser({});

    const callerId = await env.createUser({
      type: UserType.owner,
      organization: "stanford",
    });

    await expectError(
      () =>
        env.call(
          enableUser,
          { userId: authUser.uid },
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

  it("should not allow clinician to enable a non-patient user", async () => {
    const userId = await env.createUser({
      type: UserType.clinician,
      organization: "stanford",
      disabled: true,
    });

    const callerId = await env.createUser({
      type: UserType.clinician,
      organization: "stanford",
    });

    await expectError(
      () =>
        env.call(
          enableUser,
          { userId: userId },
          {
            uid: callerId,
            token: {
              type: UserType.clinician,
              organization: "stanford",
              disabled: false,
            },
          },
        ),
      (error) =>
        expect(error).toHaveProperty(
          "message",
          "User does not have permission.",
        ),
    );

    const userService = env.factory.user();
    const user = await userService.getUser(userId);
    expect(user?.content.disabled).toBe(true);
  });

  it("keeps enabled users enabled", async () => {
    const clinicianId = await env.createUser({
      type: UserType.clinician,
      organization: "stanford",
    });

    const userId = await env.createUser({
      type: UserType.patient,
      organization: "stanford",
      clinician: clinicianId,
    });

    const userService = env.factory.user();

    const originalUser = await userService.getUser(userId);
    expect(originalUser).toBeDefined();
    expect(originalUser?.content.claims.disabled).toBe(false);
    expect(originalUser?.content.disabled).toBe(false);

    await env.call(
      enableUser,
      { userId: userId },
      {
        uid: clinicianId,
        token: {
          type: UserType.clinician,
          organization: "stanford",
          disabled: false,
        },
      },
    );

    const user = await userService.getUser(userId);
    expect(user).toBeDefined();
    expect(user?.content.claims.disabled).toBe(false);
    expect(user?.content.disabled).toBe(false);
  });
});
