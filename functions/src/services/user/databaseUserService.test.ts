//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { UserType } from "@stanfordbdhg/engagehf-models";
import admin from "firebase-admin";
import { type UserService } from "./userService.js";
import { type MockFirestore } from "../../tests/mocks/firestore.js";
import { cleanupMocks, setupMockFirebase } from "../../tests/setup.js";
import { CollectionsService } from "../database/collections.js";
import { getServiceFactory } from "../factory/getServiceFactory.js";

describe("DatabaseUserService", () => {
  let mockFirestore: MockFirestore;
  let userService: UserService;
  let collectionsService: CollectionsService;

  beforeEach(() => {
    mockFirestore = setupMockFirebase().firestore;
    collectionsService = new CollectionsService(admin.firestore());
    userService = getServiceFactory().user();
  });

  afterEach(() => {
    cleanupMocks();
  });

  describe("enrollUser", () => {
    it("enrolls an admin", async () => {
      const userId = "mockAdminUserId";
      const invitationCode = "mockAdmin";
      const displayName = "Mock Admin";

      mockFirestore.replaceAll({
        invitations: {
          invitationId: {
            code: invitationCode,
            userId,
            user: {
              type: UserType.admin,
            },
            auth: {
              displayName: displayName,
            },
          },
        },
      });

      const invitation = await userService.getInvitationByCode(invitationCode);
      if (!invitation) fail("Invitation not found");
      await userService.enrollUser(invitation, userId, {
        isSingleSignOn: false,
      });

      const auth = await admin.auth().getUser(userId);
      expect(auth.displayName).toBe(displayName);

      const userSnapshot = await collectionsService.users.doc(userId).get();
      expect(userSnapshot.exists).toBe(true);
      const userData = userSnapshot.data();
      expect(userData).toBeDefined();
      expect(userData?.invitationCode).toBe(invitationCode);
      expect(userData?.dateOfEnrollment).toBeDefined();
      expect(userData?.claims).toStrictEqual({
        type: UserType.admin,
        disabled: false,
      });
    });

    it("enrolls a clinician", async () => {
      const userId = "mockClinicianUserId";
      const invitationCode = "mockClinician";
      const displayName = "Mock Clinician";

      mockFirestore.replaceAll({
        invitations: {
          invitationId: {
            code: invitationCode,
            userId,
            user: {
              type: UserType.clinician,
              organization: "mockOrganization",
            },
            auth: {
              displayName: displayName,
            },
          },
        },
        organizations: {
          mockOrganization: {},
        },
      });

      const invitation = await userService.getInvitationByCode(invitationCode);
      if (!invitation) fail("Invitation not found");
      await userService.enrollUser(invitation, userId, {
        isSingleSignOn: false,
      });

      const auth = await admin.auth().getUser(userId);
      expect(auth.displayName).toBe(displayName);

      const userSnapshot = await collectionsService.users.doc(userId).get();
      expect(userSnapshot.exists).toBe(true);
      const userData = userSnapshot.data();
      expect(userData).toBeDefined();
      expect(userData?.invitationCode).toBe(invitationCode);
      expect(userData?.dateOfEnrollment).toBeDefined();
      expect(userData?.claims).toStrictEqual({
        type: UserType.clinician,
        organization: "mockOrganization",
        disabled: false,
      });
    });

    it("enrolls a patient", async () => {
      const userId = "mockPatientUserId";
      const invitationCode = "mockPatient";
      const displayName = "Mock Patient";

      mockFirestore.replaceAll({
        invitations: {
          invitationId: {
            code: invitationCode,
            userId,
            user: {
              type: UserType.patient,
              clinician: "mockClinician",
              dateOfBirth: new Date().toISOString(),
              organization: "mockOrganization",
            },
            auth: {
              displayName: displayName,
            },
          },
        },
        organizations: {
          mockOrganization: {},
        },
      });

      const invitation = await userService.getInvitationByCode(invitationCode);
      if (!invitation) fail("Invitation not found");
      await userService.enrollUser(invitation, userId, {
        isSingleSignOn: false,
      });

      const auth = await admin.auth().getUser(userId);
      expect(auth.displayName).toBe(displayName);

      const userSnapshot = await collectionsService.users.doc(userId).get();
      expect(userSnapshot.exists).toBe(true);
      const userData = userSnapshot.data();
      expect(userData).toBeDefined();
      expect(userData?.invitationCode).toBe(invitationCode);
      expect(userData?.dateOfEnrollment).toBeDefined();
      expect(userData?.claims).toStrictEqual({
        type: UserType.patient,
        organization: "mockOrganization",
        disabled: false,
      });
    });
  });
});
