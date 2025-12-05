//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { writeFileSync } from "fs";
import {
  CachingStrategy,
  DebugDataComponent,
  StaticDataComponent,
  UserDebugDataComponent,
  UserObservationCollection,
  UserType,
} from "@stanfordbdhg/engagehf-models";
import yauzl, { type ZipFile } from "yauzl-promise";
import { _defaultSeed } from "./defaultSeed.js";
import { exportData } from "./exportData.js";
import { describeWithEmulators } from "../tests/functions/testEnvironment.js";
import { TestFlags } from "../tests/testFlags.js";

describeWithEmulators("function: exportData", (env) => {
  const date = new Date(2025, 12, 5, 21, 41, 30);
  const filePath = "src/tests/resources/patientExport.zip";
  const patientId = "engagehf-patient0-stanford.edu";

  it("filters correctly for admin", async () => {
    const patient0 = await env.createUser({
      type: UserType.patient,
      organization: "stanford",
    });

    const patient1 = await env.createUser({
      type: UserType.patient,
      organization: "jhu",
    });

    const admin = await env.createUser({
      type: UserType.admin,
    });

    const result = await env.call(
      exportData,
      {},
      {
        uid: admin,
        token: { type: UserType.admin },
      },
    );

    const buffer = Buffer.from(result.content, "base64");
    expect(buffer.length).toBeGreaterThan(0);

    const zip = await yauzl.fromBuffer(buffer);
    const entries = await zip.readEntries();
    const filenames = entries.map((entry) => entry.filename);

    expect(filenames).toContain(`${patient0}/appointments.csv`);
    expect(filenames).toContain(`${patient1}/appointments.csv`);
  }, 10_000);

  it("filters correctly for owner", async () => {
    const patient0 = await env.createUser({
      type: UserType.patient,
      organization: "stanford",
    });

    const patient1 = await env.createUser({
      type: UserType.patient,
      organization: "jhu",
    });

    const owner = await env.createUser({
      type: UserType.owner,
      organization: "stanford",
    });

    const result = await env.call(
      exportData,
      {},
      {
        uid: owner,
        token: { type: UserType.owner, organization: "stanford" },
      },
    );

    const buffer = Buffer.from(result.content, "base64");
    expect(buffer.length).toBeGreaterThan(0);

    const zip = await yauzl.fromBuffer(buffer);
    const entries = await zip.readEntries();
    const filenames = entries.map((entry) => entry.filename);
    expect(filenames).toContain(`${patient0}/appointments.csv`);
    expect(filenames).not.toContain(`${patient1}/appointments.csv`);
  }, 10_000);

  it("rejects unauthorized users", async () => {
    const patient = await env.createUser({
      type: UserType.patient,
      organization: "stanford",
    });

    const otherPatient = await env.createUser({
      type: UserType.patient,
      organization: "stanford",
    });

    await expect(
      env.call(
        exportData,
        { userId: patient },
        {
          uid: otherPatient,
          token: { type: UserType.patient, organization: "stanford" },
        },
      ),
    ).rejects.toThrow("User does not have permission.");

    const clinician = await env.createUser({
      type: UserType.clinician,
      organization: "stanford",
    });

    await expect(
      env.call(
        exportData,
        { userId: patient },
        {
          uid: clinician,
          token: { type: UserType.clinician, organization: "stanford" },
        },
      ),
    ).rejects.toThrow("User does not have permission.");
  }, 5_000);

  it("exports data for authenticated user", async () => {
    await _defaultSeed(env.factory, {
      date,
      only: Object.values(DebugDataComponent),
      staticData: {
        only: Object.values(StaticDataComponent),
        cachingStrategy: CachingStrategy.expectCache,
      },
      onlyUserCollections: Object.values(UserDebugDataComponent).filter(
        (value) => value !== UserDebugDataComponent.consent,
      ),
      userData: [],
    });

    const adminId = "engagehf-admin0-stanford.edu";

    const exportedData = await env.call(
      exportData,
      { userId: patientId },
      {
        uid: adminId,
        token: { type: UserType.admin },
      },
    );

    expect(exportedData).toBeDefined();
    expect(exportedData).toHaveProperty("content");
    expect(exportedData.content.length).toBeGreaterThan(0);

    const data = Buffer.from(exportedData.content, "base64");
    if (TestFlags.regenerateValues) {
      writeFileSync(filePath, data);
    } else {
      await expectZipToBeEquivalent(
        await yauzl.open(filePath),
        await yauzl.fromBuffer(data),
      );
    }
  }, 60_000);

  it("exports all relevant files for a patient", async () => {
    const zip = await yauzl.open(filePath);
    const entries = await zip.readEntries();
    const filenames = entries.map((entry) => entry.filename);

    const questionnaireIds = [
      "0",
      "dataUpdate_en_US",
      "postAppointment_en_US",
      "registration_en_US",
    ];
    const expectedFileNames = [
      ...questionnaireIds.map((id) => `questionnaire_${id}.csv`),
      ...Object.values(UserObservationCollection).map(
        (collection) => `${patientId}/${collection}.csv`,
      ),
      `${patientId}/appointments.csv`,
      `${patientId}/medicationRequests.csv`,
      `${patientId}/messages.csv`,
      `${patientId}/questionnaireResponses_kccq.csv`,
      `${patientId}/symptomScores.csv`,
    ];
    expect(filenames.sort()).toEqual(expectedFileNames.sort());

    for (const entry of entries) {
      const buffer = await entryBuffer(entry);
      expect(buffer.length).toBeGreaterThan(0);
      const lines = buffer
        .toString("utf-8")
        .split("\n")
        .filter((line) => line.trim().length > 0);
      expect(lines.length).toBeGreaterThan(0);
    }
  }, 10_000);

  async function expectZipToBeEquivalent(
    file0: ZipFile,
    file1: ZipFile,
  ): Promise<void> {
    const entries0 = await file0.readEntries();
    const entries1 = await file1.readEntries();

    const filenames0 = entries0.map((entry) => entry.filename).sort();
    const filenames1 = entries1.map((entry) => entry.filename).sort();
    expect(filenames0).toEqual(filenames1);

    for (const entry0 of entries0) {
      const entry1 = entries1.find(
        (entry) => entry.filename == entry0.filename,
      );
      expect(entry1).toBeDefined();

      const data0 = await entryBuffer(entry0);
      const data1 = await entryBuffer(entry1!);

      if (!data0.equals(data1)) {
        console.error(`Data doesn't match for ${entry0.filename}`);
      }
      expect(data0).toEqual(data1);
    }
  }

  async function entryBuffer(entry: yauzl.Entry): Promise<Buffer> {
    const stream = await entry.openReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    return Buffer.concat(chunks);
  }
});
