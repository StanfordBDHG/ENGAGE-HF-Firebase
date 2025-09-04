//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  advanceDateByDays,
  FHIRObservation,
  LoincCode,
  QuantityUnit,
  UserMessageType,
  UserType,
  UserObservationCollection,
  advanceDateByMinutes,
} from "@stanfordbdhg/engagehf-models";
import { onUserBodyWeightObservationWritten } from "./onUserBodyWeightObservationWritten.js";
import { describeWithEmulators } from "../tests/functions/testEnvironment.js";

describeWithEmulators("onUserBodyWeightObservationWritten", (env) => {
  let ownerId: string;
  let clinicianId: string;
  let patientId: string;
  const date = new Date();

  const observations = Array.from({ length: 10 }).map((_, i) =>
    FHIRObservation.createSimple({
      id: i.toString(),
      date: advanceDateByDays(date, -i - 3),
      value: 100.0,
      unit: QuantityUnit.lbs,
      code: LoincCode.bodyWeight,
    }),
  );

  beforeEach(async () => {
    ownerId = await env.createUser({
      type: UserType.owner,
      organization: "stanford",
    });
    clinicianId = await env.createUser({
      type: UserType.clinician,
      organization: "stanford",
    });
    patientId = await env.createUser({
      type: UserType.patient,
      organization: "stanford",
      clinician: clinicianId,
    });

    for (const observation of observations) {
      await env.collections
        .userObservations(patientId, UserObservationCollection.bodyWeight)
        .doc()
        .set(observation);
    }
  });

  it("creates message for high body weight, keeps it when still high and completes when it lowers again", async () => {
    const observation0 = FHIRObservation.createSimple({
      id: "100",
      date: advanceDateByDays(date, -2),
      value: 120.0,
      unit: QuantityUnit.lbs,
      code: LoincCode.bodyWeight,
    });

    await env.setWithTrigger(onUserBodyWeightObservationWritten, {
      data: observation0,
      ref: env.collections
        .userObservations(patientId, UserObservationCollection.bodyWeight)
        .doc("100"),
      params: {
        userId: patientId,
        observationId: "100",
      },
    });

    const messages0 = await env.collections.userMessages(patientId).get();
    expect(messages0.docs).toHaveLength(1);
    const message0 = messages0.docs[0].data();
    expect(message0).toBeDefined();
    expect(message0.type).toBe(UserMessageType.weightGain);
    expect(message0.completionDate).toBeUndefined();

    const observation1 = FHIRObservation.createSimple({
      id: "101",
      date: advanceDateByDays(date, -1),
      value: 120.0,
      unit: QuantityUnit.lbs,
      code: LoincCode.bodyWeight,
    });

    await env.setWithTrigger(onUserBodyWeightObservationWritten, {
      data: observation1,
      ref: env.collections
        .userObservations(patientId, UserObservationCollection.bodyWeight)
        .doc("101"),
      params: {
        userId: patientId,
        observationId: "101",
      },
    });

    const messages1 = await env.collections.userMessages(patientId).get();
    expect(messages1.docs.length).toBe(1);
    const message1 = messages1.docs[0].data();
    expect(message1).toBeDefined();
    expect(message1.type).toBe(UserMessageType.weightGain);
    expect(message1.creationDate.toISOString()).toBe(
      message0.creationDate.toISOString(),
    );
    expect(message1.completionDate).toBeUndefined();

    const observation2 = FHIRObservation.createSimple({
      id: "102",
      date: date,
      value: 100.0,
      unit: QuantityUnit.lbs,
      code: LoincCode.bodyWeight,
    });

    await env.setWithTrigger(onUserBodyWeightObservationWritten, {
      data: observation2,
      ref: env.collections
        .userObservations(patientId, UserObservationCollection.bodyWeight)
        .doc("102"),
      params: {
        userId: patientId,
        observationId: "102",
      },
    });

    const messages2 = await env.collections.userMessages(patientId).get();
    expect(messages2.docs.length).toBe(1);
    const message2 = messages2.docs[0].data();
    expect(message2.completionDate).toBeDefined();
  });

  it("should create a weight gain message for a user", async () => {
    const ownerId = await env.createUser({
      type: UserType.owner,
      organization: "stanford",
    });

    const clinicianId = await env.createUser({
      type: UserType.clinician,
      organization: "stanford",
    });

    const patientId = await env.createUser({
      type: UserType.patient,
      organization: "stanford",
      clinician: clinicianId,
    });

    const observations = Array.from({ length: 10 }, (_, i) =>
      FHIRObservation.createSimple({
        id: `observation-${i}`,
        code: LoincCode.bodyWeight,
        value: 200,
        unit: QuantityUnit.lbs,
        date: advanceDateByDays(new Date(), -i - 1),
      }),
    );

    await Promise.all(
      observations.map(async (observation) => {
        const ref = env.collections
          .userObservations(patientId, UserObservationCollection.bodyWeight)
          .doc();
        await env.setWithTrigger(onUserBodyWeightObservationWritten, {
          ref,
          data: observation,
          params: {
            userId: patientId,
            observationId: ref.id,
          },
        });
      }),
    );
    const patientMessages0 = await env.collections
      .userMessages(patientId)
      .get();
    expect(patientMessages0.docs).toHaveLength(0);

    const clinicianMessages0 = await env.collections
      .userMessages(clinicianId)
      .get();
    expect(clinicianMessages0.docs).toHaveLength(0);

    const ownerMessages0 = await env.collections.userMessages(ownerId).get();
    expect(ownerMessages0.docs).toHaveLength(0);

    const slightlyHigherWeight = FHIRObservation.createSimple({
      id: "observation-10",
      code: LoincCode.bodyWeight,
      value: 207.5,
      unit: QuantityUnit.lbs,
      date: advanceDateByMinutes(new Date(), -30),
    });
    const slightlyHigherRef = env.collections
      .userObservations(patientId, UserObservationCollection.bodyWeight)
      .doc();
    await env.setWithTrigger(onUserBodyWeightObservationWritten, {
      ref: slightlyHigherRef,
      data: slightlyHigherWeight,
      params: {
        userId: patientId,
        observationId: slightlyHigherRef.id,
      },
    });
    const patientMessages1 = await env.collections
      .userMessages(patientId)
      .get();
    expect(patientMessages1.docs).toHaveLength(1);
    const patientMessage1 = patientMessages1.docs.at(0)?.data();
    expect(patientMessage1?.type).toBe(UserMessageType.weightGain);
    expect(patientMessage1?.completionDate).toBeUndefined();

    const clinicianMessages1 = await env.collections
      .userMessages(clinicianId)
      .get();
    expect(clinicianMessages1.docs).toHaveLength(1);
    const clinicianMessage1 = clinicianMessages1.docs.at(0)?.data();
    expect(clinicianMessage1?.type).toBe(UserMessageType.weightGain);
    expect(clinicianMessage1?.completionDate).toBeUndefined();

    const ownerMessages1 = await env.collections.userMessages(ownerId).get();
    expect(ownerMessages1.docs).toHaveLength(1);
    const ownerMessage1 = clinicianMessages1.docs.at(0)?.data();
    expect(ownerMessage1?.type).toBe(UserMessageType.weightGain);
    expect(ownerMessage1?.completionDate).toBeUndefined();

    const actuallyHigherWeight = FHIRObservation.createSimple({
      id: "observation-11",
      code: LoincCode.bodyWeight,
      value: 208,
      unit: QuantityUnit.lbs,
      date: advanceDateByMinutes(new Date(), -15),
    });
    const actuallyHigherRef = env.collections
      .userObservations(patientId, UserObservationCollection.bodyWeight)
      .doc();
    await env.setWithTrigger(onUserBodyWeightObservationWritten, {
      ref: actuallyHigherRef,
      data: actuallyHigherWeight,
      params: {
        userId: patientId,
        observationId: actuallyHigherRef.id,
      },
    });
    const patientMessages2 = await env.collections
      .userMessages(patientId)
      .get();
    expect(patientMessages2.docs).toHaveLength(1);
    const patientMessage2 = patientMessages1.docs.at(0)?.data();
    expect(patientMessage2?.type).toBe(UserMessageType.weightGain);
    expect(patientMessage2?.completionDate).toBeUndefined();

    const clinicianMessages2 = await env.collections
      .userMessages(clinicianId)
      .get();
    expect(clinicianMessages2.docs).toHaveLength(1);
    const clinicianMessage2 = clinicianMessages1.docs.at(0)?.data();
    expect(clinicianMessage2?.type).toBe(UserMessageType.weightGain);
    expect(clinicianMessage2?.completionDate).toBeUndefined();

    const ownerMessages2 = await env.collections.userMessages(ownerId).get();
    expect(ownerMessages2.docs).toHaveLength(1);
    const ownerMessage2 = ownerMessages2.docs.at(0)?.data();
    expect(ownerMessage2?.type).toBe(UserMessageType.weightGain);
    expect(ownerMessage2?.completionDate).toBeUndefined();
  }, 30_000);
});
