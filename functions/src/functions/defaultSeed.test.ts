//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  CachingStrategy,
  DebugDataComponent,
  StaticDataComponent,
  UserDebugDataComponent,
  UserType,
  UserObservationCollection,
} from '@stanfordbdhg/engagehf-models'
import { expect } from 'chai'
import { _defaultSeed } from './defaultSeed.js'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'

describeWithEmulators('function: defaultSeed', (env) => {
  it('seeds the database successfully', async () => {
    await _defaultSeed(env.factory, {
      date: new Date(),
      only: Object.values(DebugDataComponent),
      staticData: {
        only: Object.values(StaticDataComponent),
        cachingStrategy: CachingStrategy.expectCache,
      },
      onlyUserCollections: Object.values(UserDebugDataComponent).filter(
        (value) => value !== UserDebugDataComponent.consent,
      ),
      userData: [],
    })

    const invitations = await env.collections.invitations.get()
    expect(
      invitations.docs,
      'invitation count',
    ).to.have.length.greaterThanOrEqual(8)

    const users = await env.collections.users.get()
    expect(users.docs, 'user count').to.have.length.greaterThanOrEqual(8)

    const user = users.docs.find(
      (userDoc) => userDoc.data().type === UserType.patient,
    )
    expect(user).to.exist

    if (user === undefined) expect.fail('user is undefined')

    const userAppointments = await env.collections
      .userAppointments(user.id)
      .get()
    expect(
      userAppointments.docs,
      'user appointment count',
    ).to.have.length.greaterThanOrEqual(1)

    const userMessages = await env.collections.userMessages(user.id).get()
    expect(
      userMessages.docs,
      'user messages count',
    ).to.have.length.greaterThanOrEqual(1)

    for (const observationType of Object.values(UserObservationCollection)) {
      const userObservations = await env.collections
        .userObservations(user.id, observationType)
        .get()
      expect(
        userObservations.docs,
        `user ${observationType} observation count`,
      ).to.have.length.greaterThanOrEqual(1)
    }

    const userQuestionnaireResponses = await env.collections
      .userQuestionnaireResponses(user.id)
      .get()
    expect(
      userQuestionnaireResponses.docs,
      'user questionnaire response count',
    ).to.have.length.greaterThanOrEqual(1)

    const userSymptomScores = await env.collections
      .userQuestionnaireResponses(user.id)
      .get()
    expect(
      userSymptomScores.docs,
      'user symptom score count',
    ).to.have.length.greaterThanOrEqual(1)
  })
})
