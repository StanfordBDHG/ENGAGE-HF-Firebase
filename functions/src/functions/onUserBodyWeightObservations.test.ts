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
} from '@stanfordbdhg/engagehf-models'
import { onUserBodyWeightObservationWritten } from './onUserBodyWeightObservationWritten.js'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'

describeWithEmulators('onUserBodyWeightObservationWritten', (env) => {
  let ownerId: string
  let clinicianId: string
  let patientId: string
  const date = new Date()

  const observations = Array.from({ length: 10 }).map((_, i) =>
    FHIRObservation.createSimple({
      id: i.toString(),
      date: advanceDateByDays(date, -i - 3),
      value: 100.0,
      unit: QuantityUnit.lbs,
      code: LoincCode.bodyWeight,
    }),
  )

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

    for (const observation of observations) {
      await env.collections
        .userObservations(patientId, UserObservationCollection.bodyWeight)
        .doc()
        .set(observation)
    }
  })

  it('creates message for high body weight, keeps it when still high and completes when it lowers again', async () => {
    const observation0 = FHIRObservation.createSimple({
      id: '100',
      date: advanceDateByDays(date, -2),
      value: 120.0,
      unit: QuantityUnit.lbs,
      code: LoincCode.bodyWeight,
    })

    await env.setWithTrigger(onUserBodyWeightObservationWritten, {
      data: observation0,
      ref: env.collections
        .userObservations(patientId, UserObservationCollection.bodyWeight)
        .doc('100'),
      params: {
        userId: patientId,
        observationId: '100',
      },
    })

    const messages0 = await env.collections.userMessages(patientId).get()
    expect(messages0.docs).toHaveLength(1)
    const message0 = messages0.docs[0].data()
    expect(message0).toBeDefined()
    expect(message0.type).toBe(UserMessageType.weightGain)
    expect(message0.completionDate).toBeUndefined()

    const observation1 = FHIRObservation.createSimple({
      id: '101',
      date: advanceDateByDays(date, -1),
      value: 120.0,
      unit: QuantityUnit.lbs,
      code: LoincCode.bodyWeight,
    })

    await env.setWithTrigger(onUserBodyWeightObservationWritten, {
      data: observation1,
      ref: env.collections
        .userObservations(patientId, UserObservationCollection.bodyWeight)
        .doc('101'),
      params: {
        userId: patientId,
        observationId: '101',
      },
    })

    const messages1 = await env.collections.userMessages(patientId).get()
    expect(messages1.docs.length).toBe(1)
    const message1 = messages1.docs[0].data()
    expect(message1).toBeDefined()
    expect(message1.type).toBe(UserMessageType.weightGain)
    expect(message1.creationDate.toISOString()).toBe(
      message0.creationDate.toISOString(),
    )
    expect(message1.completionDate).toBeUndefined()

    const observation2 = FHIRObservation.createSimple({
      id: '102',
      date: date,
      value: 100.0,
      unit: QuantityUnit.lbs,
      code: LoincCode.bodyWeight,
    })

    await env.setWithTrigger(onUserBodyWeightObservationWritten, {
      data: observation2,
      ref: env.collections
        .userObservations(patientId, UserObservationCollection.bodyWeight)
        .doc('102'),
      params: {
        userId: patientId,
        observationId: '102',
      },
    })

    const messages2 = await env.collections.userMessages(patientId).get()
    expect(messages2.docs.length).toBe(1)
    const message2 = messages2.docs[0].data()
    expect(message2.completionDate).toBeDefined()
  })
})
