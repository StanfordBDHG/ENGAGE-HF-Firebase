//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import fs from "fs";
import {
  CachingStrategy,
  LocalizedText,
  StaticDataComponent,
} from "@stanfordbdhg/engagehf-models";
import { _updateStaticData } from "./updateStaticData.js";
import { describeWithEmulators } from "../tests/functions/testEnvironment.js";
import { TestFlags } from "../tests/testFlags.js";

describeWithEmulators("function: updateStaticData", (env) => {
  it("updates static data successfully", async () => {
    await _updateStaticData(env.factory, {
      only: Object.values(StaticDataComponent),
      cachingStrategy: CachingStrategy.expectCache,
    });

    const medicationClasses = await env.collections.medicationClasses.get();
    expect(medicationClasses.docs).toHaveLength(7);
    const medicationClassesJson = JSON.parse(
      fs.readFileSync("data/medicationClasses.json", "utf8"),
    );
    for (const medicationClass of medicationClasses.docs) {
      expect(simplify(medicationClass.data())).toStrictEqual(
        medicationClassesJson[medicationClass.id],
      );
    }

    const medications = await env.collections.medications.get();
    expect(medications.docs).toHaveLength(35);
    const medicationsJson = JSON.parse(
      fs.readFileSync("data/medications.json", "utf8"),
    );
    for (const medication of medications.docs) {
      expect(simplify(medication.data())).toStrictEqual(
        medicationsJson[medication.id],
      );
    }

    const videoSections = await env.collections.videoSections.get();
    expect(videoSections.docs).toHaveLength(4);
    const videoSectionsJson = JSON.parse(
      fs.readFileSync("data/videoSections.json", "utf8"),
    );
    for (const videoSection of videoSections.docs) {
      const jsonVideoSection = videoSectionsJson[videoSection.id];
      const jsonVideos = jsonVideoSection.videos;
      delete jsonVideoSection.videos;
      expect(simplify(videoSection.data())).toStrictEqual(jsonVideoSection);

      const videos = await env.collections.videos(videoSection.id).get();
      for (const video of videos.docs) {
        expect(simplify(video.data())).toStrictEqual(jsonVideos[video.id]);
      }
    }

    const organizations = await env.collections.organizations.get();
    expect(organizations.docs).toHaveLength(4);
    const organizationsJson = JSON.parse(
      fs.readFileSync("data/organizations.json", "utf8"),
    );
    for (const organization of organizations.docs) {
      expect(simplify(organization.data())).toStrictEqual(
        organizationsJson[organization.id],
      );
    }

    const questionnaires = await env.collections.questionnaires
      .withConverter(null)
      .get();
    expect(questionnaires.docs).toHaveLength(4);
    const questionnairesJson = JSON.parse(
      fs.readFileSync("data/questionnaires.json", "utf8"),
    );
    for (const questionnaire of questionnaires.docs) {
      expect(simplify(questionnaire.data())).toStrictEqual(
        questionnairesJson[questionnaire.id],
      );
    }
  });

  it("creates the same questionnaires again", async () => {
    await _updateStaticData(env.factory, {
      only: [StaticDataComponent.questionnaires],
      cachingStrategy:
        TestFlags.regenerateValues ?
          CachingStrategy.updateCache
        : CachingStrategy.ignoreCache,
    });

    const questionnaires = await env.collections.questionnaires
      .withConverter(null)
      .get();
    expect(questionnaires.docs).toHaveLength(4);
    const questionnairesJson = JSON.parse(
      fs.readFileSync("data/questionnaires.json", "utf8"),
    );
    for (const questionnaire of questionnaires.docs) {
      expect(simplify(questionnaire.data())).toStrictEqual(
        questionnairesJson[questionnaire.id],
      );
    }
  });
});

function simplify(data: unknown): unknown {
  return JSON.parse(
    JSON.stringify(data, (_, value): unknown => {
      if (value instanceof LocalizedText) {
        return value.content;
      }
      return value;
    }),
  );
}
