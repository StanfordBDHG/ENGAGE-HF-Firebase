//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  FHIRAppointment,
  FHIRAppointmentStatus,
  User,
  UserType,
} from '@stanfordbdhg/engagehf-models'
import { expect } from 'chai'
import { deleteUser } from './deleteUser.js'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'
import { expectError } from '../tests/helpers.js'

describeWithEmulators('function: deleteUser', (env) => {
  const user = new User({
    type: UserType.patient,
    organization: 'stanford',
    receivesAppointmentReminders: true,
    receivesMedicationUpdates: true,
    receivesRecommendationUpdates: true,
    receivesQuestionnaireReminders: false,
    receivesVitalsReminders: false,
    receivesWeightAlerts: true,
    invitationCode: 'PATIENT0',
    dateOfEnrollment: new Date('2020-01-01'),
  })

  it('should not allow deleting user without claims', async () => {
    const authUser = await env.auth.createUser({})
    const userRef = env.collections.users.doc(authUser.uid)
    await userRef.set(user)

    await expectError(
      () => env.call(deleteUser, { userId: userRef.id }, { uid: 'user' }),
      (error) =>
        expect(error).to.have.property(
          'message',
          'User does not have permission.',
        ),
    )

    const actualUser = await userRef.get()
    expect(actualUser.exists).to.be.true
  })

  it('should not allow deleting user with claims of other organization', async () => {
    const authUser = await env.auth.createUser({})
    const userRef = env.collections.users.doc(authUser.uid)
    await userRef.set(user)

    await expectError(
      () =>
        env.call(
          deleteUser,
          { userId: userRef.id },
          {
            uid: 'user',
            token: { type: UserType.owner, organization: 'other' },
          },
        ),
      (error) =>
        expect(error).to.have.property(
          'message',
          'User does not have permission.',
        ),
    )

    const actualUser = await userRef.get()
    expect(actualUser.exists).to.be.true
  })

  it('should delete a user', async () => {
    const authUser = await env.auth.createUser({})
    const userRef = env.collections.users.doc(authUser.uid)
    await userRef.set(user)

    const appointment = new FHIRAppointment({
      status: FHIRAppointmentStatus.booked,
      created: new Date('2020-01-01'),
      start: new Date('2020-01-01'),
      end: new Date('2020-01-01'),
    })
    const appointmentRef = env.collections.userAppointments(authUser.uid).doc()
    await appointmentRef.set(appointment)

    await env.call(
      deleteUser,
      { userId: userRef.id },
      { uid: 'user', token: { type: UserType.admin } },
    )

    const actualUser = await userRef.get()
    expect(actualUser.exists).to.be.false

    const actualAppointment = await appointmentRef.get()
    expect(actualAppointment.exists).to.be.false
  })
})
