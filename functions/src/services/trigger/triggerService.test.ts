//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  advanceDateByDays,
  FHIRAppointment,
  FHIRAppointmentStatus,
  UserMessage,
  UserMessageType,
  UserType,
} from '@stanfordbdhg/engagehf-models'
import { expect } from 'chai'
import { describeWithEmulators } from '../../tests/functions/testEnvironment.js'

describeWithEmulators('TriggerService', (env) => {
  describe('every15Minutes', () => {
    it('should create a message for an upcoming appointment', async () => {
      const userId = await env.createUser({
        type: UserType.patient,
        organization: 'stanford',
      })

      const appointment = FHIRAppointment.create({
        userId,
        status: FHIRAppointmentStatus.proposed,
        created: advanceDateByDays(new Date(), -3),
        start: advanceDateByDays(new Date(), 1.01),
        durationInMinutes: 60,
      })

      const appointmentRef = env.collections.userAppointments(userId).doc()
      await appointmentRef.set(appointment)

      await env.factory.trigger().every15Minutes()

      const messages = await env.collections.userMessages(userId).get()
      expect(messages.docs).to.have.length(1)
      const message = messages.docs.at(0)?.data()

      expect(message?.type).to.equal(UserMessageType.preAppointment)
      expect(message?.reference).to.equal(appointmentRef.path)
      expect(message?.completionDate).to.be.undefined
    })

    it('should create a complete a message for a past appointment', async () => {
      const userId = await env.createUser({
        type: UserType.patient,
        organization: 'stanford',
      })

      const appointment = FHIRAppointment.create({
        userId,
        status: FHIRAppointmentStatus.proposed,
        created: advanceDateByDays(new Date(), -3),
        start: advanceDateByDays(new Date(), -1),
        durationInMinutes: 60,
      })

      const appointmentRef = env.collections.userAppointments(userId).doc()
      await appointmentRef.set(appointment)

      const message = UserMessage.createPreAppointment({
        reference: appointmentRef.path,
      })
      const messageRef = env.collections.userMessages(userId).doc()
      await messageRef.set(message)

      await env.factory.trigger().every15Minutes()

      const messages = await env.collections.userMessages(userId).get()
      expect(messages.docs).to.have.length(1)

      const actualMessage = messages.docs.at(0)?.data()
      expect(actualMessage?.type).to.equal(UserMessageType.preAppointment)
      expect(actualMessage?.reference).to.equal(appointmentRef.path)
      expect(actualMessage?.completionDate).to.exist
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
  })
})
