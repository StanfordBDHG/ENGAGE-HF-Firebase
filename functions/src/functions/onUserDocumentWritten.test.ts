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
  UserMessage,
  UserMessageType,
  UserType,
  UserObservationCollection,
  fhirObservationConverter,
} from '@stanfordbdhg/engagehf-models'
import { expect } from 'chai'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'
import { onUserBodyWeightObservationWritten } from './onUserDocumentWritten.js'

describeWithEmulators('onUserDocumentWritten.ts', (env) => {
  describe('onUserBodyWeightObservationWritten', () => {
    let ownerId: string
    let clinicianId: string
    let patientId: string
    const date = new Date()

    const observations = Array.from({ length: 10 }).map((_, i) =>
      FHIRObservation.createSimple({
        id: i.toString(),
        date: advanceDateByDays(date, -i - 1),
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
        date: date,
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
      expect(messages0.docs.length).to.equal(1)
      const message0 = messages0.docs[0].data() as UserMessage
      expect(message0).to.exist
      expect(message0.type).to.equal(UserMessageType.weightGain)
      expect(message0.completionDate).to.not.exist

      const observation1 = FHIRObservation.createSimple({
        id: '101',
        date: date,
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
      expect(messages1.docs.length).to.equal(1)
      const message1 = messages1.docs[0].data() as UserMessage
      expect(message1).to.exist
      expect(message1.type).to.equal(UserMessageType.weightGain)
      expect(message1.creationDate.toISOString()).to.equal(
        message0.creationDate.toISOString(),
      )
      expect(message1.completionDate).to.not.exist

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
      expect(messages2.docs.length).to.equal(1)
      const message2 = messages2.docs[0].data() as UserMessage
      expect(message2.completionDate).to.exist
    })
  })
})
