//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  UserMessageType,
  UserType,
  FHIRAppointment,
  advanceDateByHours,
} from '@stanfordbdhg/engagehf-models'
import { type DocumentReference } from 'firebase-admin/firestore'
import { onUserAppointmentWritten } from './onUserAppointmentWritten.js'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'

describeWithEmulators('onUserAppointmentWritten', (env) => {
  let ownerId: string
  let clinicianId: string
  let patientId: string

  beforeEach(async () => {
    ownerId = await env.createUser({
      type: UserType.owner,
      organization: 'stanford',
    })
    clinicianId = await env.createUser({
      type: UserType.clinician,
      organization: 'stanford',
    })
    patientId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
      clinician: clinicianId,
    })
  })

  async function expectPreAppointmentMessage(ref: DocumentReference) {
    const patientMessages = await env.collections.userMessages(patientId).get()
    expect(patientMessages.docs).toHaveLength(1)
    const patientMessage = patientMessages.docs[0].data()
    expect(patientMessage).toBeDefined()
    expect(patientMessage.type).toBe(UserMessageType.preAppointment)
    expect(patientMessage.reference).toBe(ref.path)
    expect(patientMessage.completionDate).toBeUndefined()

    const clinicianMessages = await env.collections
      .userMessages(clinicianId)
      .get()
    expect(clinicianMessages.docs).toHaveLength(1)
    const clinicianMessage = clinicianMessages.docs[0].data()
    expect(clinicianMessage).toBeDefined()
    expect(clinicianMessage.type).toBe(UserMessageType.preAppointment)
    expect(clinicianMessage.reference).toBe(patientMessages.docs[0].ref.path)
    expect(clinicianMessage.completionDate).toBeUndefined()

    const ownerMessages = await env.collections.userMessages(ownerId).get()
    expect(ownerMessages.docs).toHaveLength(1)
    const ownerMessage = ownerMessages.docs[0].data()
    expect(ownerMessage).toBeDefined()
    expect(ownerMessage.type).toBe(UserMessageType.preAppointment)
    expect(ownerMessage.reference).toBe(patientMessages.docs[0].ref.path)
    expect(ownerMessage.completionDate).toBeUndefined()
  }

  async function expectCompletedPreAppointmentMessage(ref: DocumentReference) {
    const patientMessages = await env.collections.userMessages(patientId).get()
    expect(patientMessages.docs).toHaveLength(1)
    const patientMessage = patientMessages.docs[0].data()
    expect(patientMessage).toBeDefined()
    expect(patientMessage.type).toBe(UserMessageType.preAppointment)
    expect(patientMessage.reference).toBe(ref.path)
    expect(patientMessage.completionDate).toBeDefined()

    const clinicianMessages = await env.collections
      .userMessages(clinicianId)
      .get()
    expect(clinicianMessages.docs).toHaveLength(1)
    const clinicianMessage = clinicianMessages.docs[0].data()
    expect(clinicianMessage).toBeDefined()
    expect(clinicianMessage.type).toBe(UserMessageType.preAppointment)
    expect(clinicianMessage.reference).toBe(patientMessages.docs[0].ref.path)
    expect(clinicianMessage.completionDate).toBeUndefined()

    const ownerMessages = await env.collections.userMessages(ownerId).get()
    expect(ownerMessages.docs).toHaveLength(1)
    const ownerMessage = ownerMessages.docs[0].data()
    expect(ownerMessage).toBeDefined()
    expect(ownerMessage.type).toBe(UserMessageType.preAppointment)
    expect(ownerMessage.reference).toBe(patientMessages.docs[0].ref.path)
    expect(ownerMessage.completionDate).toBeUndefined()
  }

  it('should create a message when a new and upcoming appointment is created', async () => {
    const now = new Date()
    const appointment = FHIRAppointment.create({
      userId: patientId,
      created: now,
      start: advanceDateByHours(now, 23),
      durationInMinutes: 60,
    })

    const ref = env.collections.userAppointments(patientId).doc()
    await env.setWithTrigger(onUserAppointmentWritten, {
      ref,
      data: appointment,
      params: {
        userId: patientId,
        appointmentId: ref.id,
      },
    })

    await expectPreAppointmentMessage(ref)
  })

  it('should create a message when a new and upcoming appointment is updated', async () => {
    const now = new Date()

    const lateAppointment = FHIRAppointment.create({
      userId: patientId,
      created: now,
      start: advanceDateByHours(now, 25),
      durationInMinutes: 60,
    })

    const ref = env.collections.userAppointments(patientId).doc()
    await env.setWithTrigger(onUserAppointmentWritten, {
      ref,
      data: lateAppointment,
      params: {
        userId: patientId,
        appointmentId: ref.id,
      },
    })

    const patientMessages0 = await env.collections.userMessages(patientId).get()
    expect(patientMessages0.docs).toHaveLength(0)

    const clinicianMessages0 = await env.collections
      .userMessages(clinicianId)
      .get()
    expect(clinicianMessages0.docs).toHaveLength(0)

    const ownerMessages0 = await env.collections.userMessages(ownerId).get()
    expect(ownerMessages0.docs).toHaveLength(0)

    const earlierAppointment = FHIRAppointment.create({
      userId: patientId,
      created: now,
      status: 'booked',
      start: advanceDateByHours(now, 23),
      durationInMinutes: 60,
    })
    await env.setWithTrigger(onUserAppointmentWritten, {
      ref,
      data: earlierAppointment,
      params: {
        userId: patientId,
        appointmentId: ref.id,
      },
    })

    await expectPreAppointmentMessage(ref)
  })

  it('should complete the message when the appointment is updated to a future date', async () => {
    const now = new Date()
    const appointment = FHIRAppointment.create({
      userId: patientId,
      created: now,
      start: advanceDateByHours(now, 23),
      durationInMinutes: 60,
    })

    const ref = env.collections.userAppointments(patientId).doc()
    await env.setWithTrigger(onUserAppointmentWritten, {
      ref,
      data: appointment,
      params: {
        userId: patientId,
        appointmentId: ref.id,
      },
    })

    await expectPreAppointmentMessage(ref)

    const laterAppointment = FHIRAppointment.create({
      userId: patientId,
      created: now,
      start: advanceDateByHours(now, 25),
      durationInMinutes: 60,
    })
    await env.setWithTrigger(onUserAppointmentWritten, {
      ref,
      data: laterAppointment,
      params: {
        userId: patientId,
        appointmentId: ref.id,
      },
    })

    await expectCompletedPreAppointmentMessage(ref)
  })
  it('should complete the message when the appointment is deleted', async () => {
    const now = new Date()
    const appointment = FHIRAppointment.create({
      userId: patientId,
      created: now,
      status: 'booked',
      start: advanceDateByHours(now, 23),
      durationInMinutes: 60,
    })

    const ref = env.collections.userAppointments(patientId).doc()
    await env.setWithTrigger(onUserAppointmentWritten, {
      ref,
      data: appointment,
      params: {
        userId: patientId,
        appointmentId: ref.id,
      },
    })

    await expectPreAppointmentMessage(ref)

    await env.deleteWithTrigger(onUserAppointmentWritten, {
      ref,
      params: {
        userId: patientId,
        appointmentId: ref.id,
      },
    })

    await expectCompletedPreAppointmentMessage(ref)
  })
})
