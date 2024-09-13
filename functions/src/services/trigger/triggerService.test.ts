//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  advanceDateByDays,
  advanceDateByMinutes,
  FHIRAppointment,
  FHIRAppointmentStatus,
  FHIRObservation,
  LoincCode,
  QuantityUnit,
  UserMessage,
  UserMessageType,
  UserType,
} from '@stanfordbdhg/engagehf-models'
import { expect } from 'chai'
import { describeWithEmulators } from '../../tests/functions/testEnvironment.js'
import { UserObservationCollection } from '../database/collections.js'

describeWithEmulators('TriggerService', (env) => {
  describe('every15Minutes', () => {
    it('should create a message for an upcoming appointment', async () => {
      const clinicianId = await env.createUser({
        type: UserType.clinician,
        organization: 'stanford',
      })

      const patientId = await env.createUser({
        type: UserType.patient,
        organization: 'stanford',
        clinician: clinicianId,
      })

      const appointment = FHIRAppointment.create({
        userId: patientId,
        status: FHIRAppointmentStatus.proposed,
        created: advanceDateByDays(new Date(), -3),
        start: advanceDateByDays(new Date(), 1.01),
        durationInMinutes: 60,
      })

      const appointmentRef = env.collections.userAppointments(patientId).doc()
      await appointmentRef.set(appointment)

      await env.factory.trigger().every15Minutes()

      const patientMessages = await env.collections
        .userMessages(patientId)
        .get()
      expect(patientMessages.docs).to.have.length(1)
      const patientMessage = patientMessages.docs.at(0)?.data()
      expect(patientMessage?.type).to.equal(UserMessageType.preAppointment)
      expect(patientMessage?.reference).to.equal(appointmentRef.path)
      expect(patientMessage?.completionDate).to.be.undefined

      const clinicianMessages = await env.collections
        .userMessages(clinicianId)
        .get()
      expect(clinicianMessages.docs).to.have.length(1)
      const clinicianMessage = clinicianMessages.docs.at(0)?.data()
      expect(clinicianMessage?.type).to.equal(UserMessageType.preAppointment)
      expect(clinicianMessage?.reference).to.equal(appointmentRef.path)
      expect(clinicianMessage?.completionDate).to.be.undefined
    })

    it('should create a complete a message for a past appointment', async () => {
      const clinicianId = await env.createUser({
        type: UserType.clinician,
        organization: 'stanford',
      })

      const patientId = await env.createUser({
        type: UserType.patient,
        organization: 'stanford',
        clinician: clinicianId,
      })

      const appointment = FHIRAppointment.create({
        userId: patientId,
        status: FHIRAppointmentStatus.proposed,
        created: advanceDateByDays(new Date(), -3),
        start: advanceDateByDays(new Date(), -1),
        durationInMinutes: 60,
      })

      const appointmentRef = env.collections.userAppointments(patientId).doc()
      await appointmentRef.set(appointment)

      const message = UserMessage.createPreAppointment({
        reference: appointmentRef.path,
      })
      const patientMessageRef = env.collections.userMessages(patientId).doc()
      await patientMessageRef.set(message)

      const clinicianMessageRef = env.collections
        .userMessages(clinicianId)
        .doc()
      await clinicianMessageRef.set(message)

      await env.factory.trigger().every15Minutes()

      const patientMessages = await env.collections
        .userMessages(patientId)
        .get()
      expect(patientMessages.docs).to.have.length(1)
      const patientMessage = patientMessages.docs.at(0)?.data()
      expect(patientMessage?.type).to.equal(UserMessageType.preAppointment)
      expect(patientMessage?.reference).to.equal(appointmentRef.path)
      expect(patientMessage?.completionDate).to.exist

      const clinicianMessages = await env.collections
        .userMessages(patientId)
        .get()
      expect(clinicianMessages.docs).to.have.length(1)
      const clinicianMessage = clinicianMessages.docs.at(0)?.data()
      expect(clinicianMessage?.type).to.equal(UserMessageType.preAppointment)
      expect(clinicianMessage?.reference).to.equal(appointmentRef.path)
      expect(clinicianMessage?.completionDate).to.exist
    })
  })

  describe('everyMorning', () => {
    it('should create a message to remind about vitals', async () => {
      const userId = await env.createUser({
        type: UserType.patient,
        organization: 'stanford',
        dateOfEnrollment: advanceDateByDays(new Date(), -6),
      })

      await env.factory.trigger().everyMorning()

      const messages = await env.collections.userMessages(userId).get()
      expect(messages.docs).to.have.length(1)

      const message = messages.docs.at(0)?.data()
      expect(message?.type).to.equal(UserMessageType.vitals)
      expect(message?.completionDate).to.be.undefined
    })

    it('shouldn`t create a message to remind about vitals for clinicians', async () => {
      const userId = await env.createUser({
        type: UserType.clinician,
        organization: 'stanford',
        dateOfEnrollment: advanceDateByDays(new Date(), -14.5),
      })

      await env.factory.trigger().everyMorning()

      const messages = await env.collections.userMessages(userId).get()
      expect(messages.docs).to.have.length(0)
    })

    it('should create a message to remind about questionnaires if the special day has come', async () => {
      const userId = await env.createUser({
        type: UserType.patient,
        organization: 'stanford',
        dateOfEnrollment: advanceDateByDays(new Date(), -14.5),
      })

      await env.factory.trigger().everyMorning()

      const messagesResult = await env.collections.userMessages(userId).get()
      expect(messagesResult.docs).to.have.length(2)

      const messages = messagesResult.docs.map((doc) => doc.data())
      const vitalsMessage = messages.find(
        (message) => message.type === UserMessageType.vitals,
      )
      expect(vitalsMessage).to.exist
      expect(vitalsMessage?.completionDate).to.be.undefined

      const questionnaireMessage = messages.find(
        (message) => message.type === UserMessageType.symptomQuestionnaire,
      )
      expect(questionnaireMessage).to.exist
      expect(questionnaireMessage?.completionDate).to.be.undefined
    })

    it('create a message about inactivity', async () => {
      const clinicianId = await env.createUser({
        type: UserType.clinician,
        organization: 'stanford',
      })

      const patientId = await env.createUser({
        type: UserType.patient,
        organization: 'stanford',
        clinician: clinicianId,
        dateOfEnrollment: advanceDateByDays(new Date(), -2),
        lastActiveDate: advanceDateByDays(new Date(), -8),
      })

      await env.factory.trigger().everyMorning()

      const patientMessages = await env.collections
        .userMessages(patientId)
        .get()
      expect(patientMessages.docs).to.have.length(2)
      const patientMessagesData = patientMessages.docs.map((doc) => doc.data())
      const vitalsMessage = patientMessagesData
        .filter((message) => message.type === UserMessageType.vitals)
        .at(0)
      expect(vitalsMessage).to.exist
      expect(vitalsMessage?.reference).to.be.undefined
      expect(vitalsMessage?.completionDate).to.be.undefined
      const inactiveMessage = patientMessagesData
        .filter((message) => message.type === UserMessageType.vitals)
        .at(0)
      expect(inactiveMessage).to.exist
      expect(inactiveMessage?.reference).to.be.undefined
      expect(inactiveMessage?.completionDate).to.be.undefined

      const clinicianMessages = await env.collections
        .userMessages(clinicianId)
        .get()
      expect(clinicianMessages.docs).to.have.length(1)
      const clinicianMessage = clinicianMessages.docs.at(0)?.data()
      expect(clinicianMessage?.type).to.equal(UserMessageType.inactive)
      expect(clinicianMessage?.reference).to.equal(`users/${patientId}`)
      expect(clinicianMessage?.completionDate).to.be.undefined
    })

    it('create no message about inactivity', async () => {
      const clinicianId = await env.createUser({
        type: UserType.clinician,
        organization: 'stanford',
      })

      const patientId = await env.createUser({
        type: UserType.patient,
        organization: 'stanford',
        clinician: clinicianId,
        dateOfEnrollment: advanceDateByDays(new Date(), -2),
        lastActiveDate: advanceDateByDays(new Date(), -1),
      })

      await env.factory.trigger().everyMorning()

      const patientMessages = await env.collections
        .userMessages(patientId)
        .get()
      expect(patientMessages.docs).to.have.length(1)
      const patientMessage = patientMessages.docs.at(0)?.data()
      expect(patientMessage?.type).to.equal(UserMessageType.vitals)
      expect(patientMessage?.completionDate).to.be.undefined

      const clinicianMessages = await env.collections
        .userMessages(clinicianId)
        .get()
      expect(clinicianMessages.docs).to.have.length(0)
    })
  })

  describe('userObservationWritten', () => {
    describe('bodyWeightObservations', () => {
      it('should create a weight gain message for a user', async () => {
        const triggerService = env.factory.trigger()

        const clinicianId = await env.createUser({
          type: UserType.clinician,
          organization: 'stanford',
        })

        const patientId = await env.createUser({
          type: UserType.patient,
          organization: 'stanford',
          clinician: clinicianId,
        })

        const observations = Array.from({ length: 10 }, (_, i) =>
          FHIRObservation.createSimple({
            id: `observation-${i}`,
            code: LoincCode.bodyWeight,
            value: 200,
            unit: QuantityUnit.lbs,
            date: advanceDateByDays(new Date(), -i - 1),
          }),
        )

        await Promise.all(
          observations.map(async (observation) =>
            env.collections
              .userObservations(patientId, UserObservationCollection.bodyWeight)
              .doc()
              .set(observation),
          ),
        )
        await triggerService.userObservationWritten(
          patientId,
          UserObservationCollection.bodyWeight,
        )
        const patientMessages0 = await env.collections
          .userMessages(patientId)
          .get()
        expect(patientMessages0.docs).to.have.length(0)

        const clinicianMessages0 = await env.collections
          .userMessages(clinicianId)
          .get()
        expect(clinicianMessages0.docs).to.have.length(0)

        const slightlyHigherWeight = FHIRObservation.createSimple({
          id: 'observation-10',
          code: LoincCode.bodyWeight,
          value: 207.5,
          unit: QuantityUnit.lbs,
          date: advanceDateByMinutes(new Date(), -30),
        })
        await env.collections
          .userObservations(patientId, UserObservationCollection.bodyWeight)
          .doc()
          .set(slightlyHigherWeight)
        await triggerService.userObservationWritten(
          patientId,
          UserObservationCollection.bodyWeight,
        )
        const patientMessages1 = await env.collections
          .userMessages(patientId)
          .get()
        expect(patientMessages1.docs, 'patientMessages1').to.have.length(1)
        const patientMessage1 = patientMessages1.docs.at(0)?.data()
        expect(patientMessage1?.type).to.equal(UserMessageType.weightGain)
        expect(patientMessage1?.completionDate).to.be.undefined

        const clinicianMessages1 = await env.collections
          .userMessages(patientId)
          .get()
        expect(clinicianMessages1.docs, 'clinicianMessages1').to.have.length(1)
        const clinicianMessage1 = clinicianMessages1.docs.at(0)?.data()
        expect(clinicianMessage1?.type).to.equal(UserMessageType.weightGain)
        expect(clinicianMessage1?.completionDate).to.be.undefined

        const actuallyHigherWeight = FHIRObservation.createSimple({
          id: 'observation-11',
          code: LoincCode.bodyWeight,
          value: 208,
          unit: QuantityUnit.lbs,
          date: advanceDateByMinutes(new Date(), -15),
        })
        await env.collections
          .userObservations(patientId, UserObservationCollection.bodyWeight)
          .doc()
          .set(actuallyHigherWeight)
        await triggerService.userObservationWritten(
          patientId,
          UserObservationCollection.bodyWeight,
        )
        const patientMessages2 = await env.collections
          .userMessages(patientId)
          .get()
        expect(patientMessages2.docs, 'patientMessages2').to.have.length(1)
        const patientMessage2 = patientMessages1.docs.at(0)?.data()
        expect(patientMessage2?.type).to.equal(UserMessageType.weightGain)
        expect(patientMessage2?.completionDate).to.be.undefined

        const clinicianMessages2 = await env.collections
          .userMessages(patientId)
          .get()
        expect(clinicianMessages2.docs, 'clinicianMessages2').to.have.length(1)
        const clinicianMessage2 = clinicianMessages1.docs.at(0)?.data()
        expect(clinicianMessage2?.type).to.equal(UserMessageType.weightGain)
        expect(clinicianMessage2?.completionDate).to.be.undefined
      })
    })
  })
})
