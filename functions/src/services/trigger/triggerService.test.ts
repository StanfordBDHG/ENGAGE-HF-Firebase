//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  advanceDateByDays,
  FhirAppointment,
  UserMessage,
  UserMessageType,
  UserType,
  UserObservationCollection,
  QuestionnaireReference,
} from "@stanfordbdhg/engagehf-models";
import { describeWithEmulators } from "../../tests/functions/testEnvironment.js";

describeWithEmulators("TriggerService", (env) => {
  describe("everyMorning", () => {
    it("should create a message for an upcoming appointment", async () => {
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

      const appointment = FhirAppointment.create({
        userId: patientId,
        status: "proposed",
        created: advanceDateByDays(new Date(), -3),
        start: advanceDateByDays(new Date(), 1.01),
        durationInMinutes: 60,
      });

      const appointmentRef = env.collections.userAppointments(patientId).doc();
      await appointmentRef.set(appointment);

      await env.factory.trigger().everyMorning();

      const patientMessages = await env.collections
        .userMessages(patientId)
        .get();
      expect(patientMessages.docs).toHaveLength(2);
      const preAppointmentMessages = patientMessages.docs.filter(
        (doc) => doc.data().type === UserMessageType.preAppointment,
      );
      expect(preAppointmentMessages).toHaveLength(1);
      const patientMessage = preAppointmentMessages.at(0)?.data();
      expect(patientMessage?.type).toBe(UserMessageType.preAppointment);
      expect(patientMessage?.reference).toBe(appointmentRef.path);
      expect(patientMessage?.completionDate).toBeUndefined();

      const clinicianMessages = await env.collections
        .userMessages(clinicianId)
        .get();
      expect(clinicianMessages.docs).toHaveLength(1);
      const clinicianMessage = clinicianMessages.docs.at(0)?.data();
      expect(clinicianMessage?.type).toBe(UserMessageType.preAppointment);
      expect(clinicianMessage?.reference).toBe(
        preAppointmentMessages.at(0)?.ref.path,
      );
      expect(clinicianMessage?.completionDate).toBeUndefined();

      const ownerMessages = await env.collections.userMessages(ownerId).get();
      expect(ownerMessages.docs).toHaveLength(1);
      const ownerMessage = clinicianMessages.docs.at(0)?.data();
      expect(ownerMessage?.type).toBe(UserMessageType.preAppointment);
      expect(ownerMessage?.reference).toBe(
        preAppointmentMessages.at(0)?.ref.path,
      );
      expect(ownerMessage?.completionDate).toBeUndefined();
    });

    it("should complete a message for a past appointment", async () => {
      const clinicianId = await env.createUser({
        type: UserType.clinician,
        organization: "stanford",
      });

      const patientId = await env.createUser({
        type: UserType.patient,
        organization: "stanford",
        clinician: clinicianId,
      });

      const appointment = FhirAppointment.create({
        userId: patientId,
        status: "proposed",
        created: advanceDateByDays(new Date(), -3),
        start: advanceDateByDays(new Date(), -1),
        durationInMinutes: 60,
      });

      const appointmentRef = env.collections.userAppointments(patientId).doc();
      await appointmentRef.set(appointment);

      const patientMessage = UserMessage.createPreAppointment({
        reference: appointmentRef.path,
      });
      const patientMessageRef = env.collections.userMessages(patientId).doc();
      await patientMessageRef.set(patientMessage);

      const clinicianMessage = UserMessage.createPreAppointmentForClinician({
        userId: patientId,
        userName: "Mock",
        reference: patientMessageRef.path,
      });

      const clinicianMessageRef = env.collections
        .userMessages(clinicianId)
        .doc();
      await clinicianMessageRef.set(clinicianMessage);

      await env.factory.trigger().everyMorning();

      const patientMessages = await env.collections
        .userMessages(patientId)
        .get();
      expect(patientMessages.docs).toHaveLength(2);
      const preAppointmentMessages = patientMessages.docs.filter(
        (doc) => doc.data().type === UserMessageType.preAppointment,
      );
      expect(preAppointmentMessages).toHaveLength(1);
      const patientMessageData = preAppointmentMessages.at(0)?.data();
      expect(patientMessageData?.type).toBe(UserMessageType.preAppointment);
      expect(patientMessageData?.reference).toBe(appointmentRef.path);
      expect(patientMessageData?.completionDate).toBeDefined();

      const clinicianMessages = await env.collections
        .userMessages(clinicianId)
        .get();
      expect(clinicianMessages.docs).toHaveLength(1);
      const clinicianMessageData = clinicianMessages.docs.at(0)?.data();
      expect(clinicianMessageData?.type).toBe(UserMessageType.preAppointment);
      expect(clinicianMessageData?.reference).toBe(patientMessageRef.path);
      expect(clinicianMessageData?.completionDate).toBeUndefined(); // this message will need to be manually completed
    });

    it("should complete a message for a past appointment and request a post appointment questionnaire for self-managed patients", async () => {
      const clinicianId = await env.createUser({
        type: UserType.clinician,
        organization: "stanford",
      });

      const patientId = await env.createUser({
        type: UserType.patient,
        organization: "stanford",
        clinician: clinicianId,
        selfManaged: true,
      });

      const appointment = FhirAppointment.create({
        userId: patientId,
        status: "proposed",
        created: advanceDateByDays(new Date(), -3),
        start: advanceDateByDays(new Date(), -1),
        durationInMinutes: 60,
      });

      const appointmentRef = env.collections.userAppointments(patientId).doc();
      await appointmentRef.set(appointment);

      const patientMessage = UserMessage.createPreAppointment({
        reference: appointmentRef.path,
      });
      const patientMessageRef = env.collections.userMessages(patientId).doc();
      await patientMessageRef.set(patientMessage);

      const clinicianMessage = UserMessage.createPreAppointmentForClinician({
        userId: patientId,
        userName: "Mock",
        reference: patientMessageRef.path,
      });

      const clinicianMessageRef = env.collections
        .userMessages(clinicianId)
        .doc();
      await clinicianMessageRef.set(clinicianMessage);

      await env.factory.trigger().everyMorning();

      const patientMessages = await env.collections
        .userMessages(patientId)
        .get();
      expect(patientMessages.docs).toHaveLength(3);
      const patientMessagesData = patientMessages.docs.map((doc) => doc.data());
      const preAppointmentMessages = patientMessagesData.filter(
        (message) => message.type === UserMessageType.preAppointment,
      );
      expect(preAppointmentMessages).toHaveLength(1);
      const patientMessageData = preAppointmentMessages.at(0);
      expect(patientMessageData?.type).toBe(UserMessageType.preAppointment);
      expect(patientMessageData?.reference).toBe(appointmentRef.path);
      expect(patientMessageData?.completionDate).toBeDefined();

      const postAppointmentQuestionnaireMessages = patientMessagesData.filter(
        (message) =>
          message.type === UserMessageType.postAppointmentQuestionnaire,
      );
      expect(postAppointmentQuestionnaireMessages).toHaveLength(1);
      const postAppointmentQuestionnaireMessage =
        postAppointmentQuestionnaireMessages.at(0);
      expect(postAppointmentQuestionnaireMessage?.action).toBe(
        QuestionnaireReference.postAppointment_en_US,
      );
      expect(
        postAppointmentQuestionnaireMessage?.completionDate,
      ).toBeUndefined();

      const clinicianMessages = await env.collections
        .userMessages(clinicianId)
        .get();
      expect(clinicianMessages.docs).toHaveLength(1);
      const clinicianMessageData = clinicianMessages.docs.at(0)?.data();
      expect(clinicianMessageData?.type).toBe(UserMessageType.preAppointment);
      expect(clinicianMessageData?.reference).toBe(patientMessageRef.path);
      expect(clinicianMessageData?.completionDate).toBeUndefined(); // this message will need to be manually completed
    });

    it("should create a message to remind about vitals", async () => {
      const userId = await env.createUser({
        type: UserType.patient,
        organization: "stanford",
        dateOfEnrollment: advanceDateByDays(new Date(), -6),
      });

      await env.factory.trigger().everyMorning();

      const messages = await env.collections.userMessages(userId).get();
      expect(messages.docs).toHaveLength(1);

      const message = messages.docs.at(0)?.data();
      expect(message?.type).toBe(UserMessageType.vitals);
      expect(message?.completionDate).toBeUndefined();
    });

    it("shouldn`t create a message to remind about vitals for clinicians", async () => {
      const userId = await env.createUser({
        type: UserType.clinician,
        organization: "stanford",
        dateOfEnrollment: advanceDateByDays(new Date(), -14.5),
      });

      await env.factory.trigger().everyMorning();

      const messages = await env.collections.userMessages(userId).get();
      expect(messages.docs).toHaveLength(0);
    });

    it("should create a message to remind about questionnaires if the special day has come", async () => {
      const userId = await env.createUser({
        type: UserType.patient,
        organization: "stanford",
        dateOfEnrollment: advanceDateByDays(new Date(), -14.5),
      });

      await env.factory.trigger().everyMorning();

      const messagesResult = await env.collections.userMessages(userId).get();
      expect(messagesResult.docs).toHaveLength(2);

      const messages = messagesResult.docs.map((doc) => doc.data());
      const vitalsMessage = messages.find(
        (message) => message.type === UserMessageType.vitals,
      );
      expect(vitalsMessage).toBeDefined();
      expect(vitalsMessage?.completionDate).toBeUndefined();

      const questionnaireMessage = messages.find(
        (message) => message.type === UserMessageType.symptomQuestionnaire,
      );
      expect(questionnaireMessage).toBeDefined();
      expect(questionnaireMessage?.completionDate).toBeUndefined();
    });

    it("create a message about inactivity", async () => {
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
        dateOfEnrollment: advanceDateByDays(new Date(), -2),
        lastActiveDate: advanceDateByDays(new Date(), -8),
      });

      await env.factory.trigger().everyMorning();

      const patientMessages = await env.collections
        .userMessages(patientId)
        .get();
      expect(patientMessages.docs).toHaveLength(2);
      const patientMessagesData = patientMessages.docs.map((doc) => doc.data());
      const vitalsMessage = patientMessagesData
        .filter((message) => message.type === UserMessageType.vitals)
        .at(0);
      expect(vitalsMessage).toBeDefined();
      expect(vitalsMessage?.reference).toBeUndefined();
      expect(vitalsMessage?.completionDate).toBeUndefined();
      const inactiveMessage = patientMessagesData
        .filter((message) => message.type === UserMessageType.inactive)
        .at(0);
      expect(inactiveMessage).toBeDefined();
      expect(inactiveMessage?.reference).toBeUndefined();
      expect(inactiveMessage?.completionDate).toBeUndefined();

      const clinicianMessages = await env.collections
        .userMessages(clinicianId)
        .get();
      expect(clinicianMessages.docs).toHaveLength(1);
      const clinicianMessage = clinicianMessages.docs.at(0)?.data();
      expect(clinicianMessage?.type).toBe(UserMessageType.inactive);
      expect(clinicianMessage?.reference).toBe(
        patientMessages.docs
          .filter((doc) => doc.data().type === UserMessageType.inactive)
          .at(0)?.ref.path,
      );
      expect(clinicianMessage?.completionDate).toBeUndefined();

      const ownerMessages = await env.collections.userMessages(ownerId).get();
      expect(ownerMessages.docs).toHaveLength(1);
      const ownerMessage = clinicianMessages.docs.at(0)?.data();
      expect(ownerMessage?.type).toBe(UserMessageType.inactive);
      expect(ownerMessage?.reference).toBe(
        patientMessages.docs
          .filter((doc) => doc.data().type === UserMessageType.inactive)
          .at(0)?.ref.path,
      );
      expect(ownerMessage?.completionDate).toBeUndefined();
    });

    it("should complete inactivity messages", async () => {
      const clinicianId = await env.createUser({
        type: UserType.clinician,
        organization: "stanford",
      });

      const patientId = await env.createUser({
        type: UserType.patient,
        organization: "stanford",
        clinician: clinicianId,
        dateOfEnrollment: advanceDateByDays(new Date(), -2),
        lastActiveDate: advanceDateByDays(new Date(), -8),
      });

      const triggerService = env.factory.trigger();
      await triggerService.everyMorning();

      const patientMessages = await env.collections
        .userMessages(patientId)
        .get();
      expect(patientMessages.docs).toHaveLength(2);
      const patientMessagesData = patientMessages.docs.map((doc) => doc.data());
      const vitalsMessage = patientMessagesData
        .filter((message) => message.type === UserMessageType.vitals)
        .at(0);
      expect(vitalsMessage).toBeDefined();
      expect(vitalsMessage?.reference).toBeUndefined();
      expect(vitalsMessage?.completionDate).toBeUndefined();
      const inactiveMessage = patientMessagesData
        .filter((message) => message.type === UserMessageType.inactive)
        .at(0);
      expect(inactiveMessage).toBeDefined();
      expect(inactiveMessage?.reference).toBeUndefined();
      expect(inactiveMessage?.completionDate).toBeUndefined();

      await triggerService.userObservationWritten(
        patientId,
        UserObservationCollection.heartRate,
      );

      const updatedPatientMessages = await env.collections
        .userMessages(patientId)
        .get();
      expect(patientMessages.docs).toHaveLength(2);
      const updatedPatientMessagesData = updatedPatientMessages.docs.map(
        (doc) => doc.data(),
      );
      const updatedVitalsMessage = updatedPatientMessagesData
        .filter((message) => message.type === UserMessageType.vitals)
        .at(0);
      expect(updatedVitalsMessage).toBeDefined();
      expect(updatedVitalsMessage?.reference).toBeUndefined();
      expect(updatedVitalsMessage?.completionDate).toBeUndefined();

      const updatedInactiveMessage = updatedPatientMessagesData
        .filter((message) => message.type === UserMessageType.inactive)
        .at(0);
      expect(updatedInactiveMessage).toBeDefined();
      expect(updatedInactiveMessage?.reference).toBeUndefined();
      expect(updatedInactiveMessage?.completionDate).toBeDefined();
    });

    it("create no message about inactivity", async () => {
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
        dateOfEnrollment: advanceDateByDays(new Date(), -2),
        lastActiveDate: advanceDateByDays(new Date(), -1),
      });

      await env.factory.trigger().everyMorning();

      const patientMessages = await env.collections
        .userMessages(patientId)
        .get();
      expect(patientMessages.docs).toHaveLength(1);
      const patientMessage = patientMessages.docs.at(0)?.data();
      expect(patientMessage?.type).toBe(UserMessageType.vitals);
      expect(patientMessage?.completionDate).toBeUndefined();

      const clinicianMessages = await env.collections
        .userMessages(clinicianId)
        .get();
      expect(clinicianMessages.docs).toHaveLength(0);

      const ownerMessages = await env.collections.userMessages(ownerId).get();
      expect(ownerMessages.docs).toHaveLength(0);
    });
  });
});
