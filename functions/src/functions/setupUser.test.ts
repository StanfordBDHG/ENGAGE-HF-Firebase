//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'
import {
  FHIRAppointment,
  fhirAppointmentConverter,
  FHIRAppointmentStatus,
  FHIRObservation,
  fhirObservationConverter,
  Invitation,
  LoincCode,
  QuantityUnit,
  UserAuth,
  UserMessageType,
  UserRegistration,
  UserType,
} from '@stanfordbdhg/engagehf-models'
import { UserObservationCollection } from '../services/database/collections.js'
import { checkInvitationCode } from './checkInvitationCode.js'
import { setupUser } from './setupUser.js'
import { expectError } from '../tests/helpers.js'

describeWithEmulators('function: setupUser', (env) => {
  it('fails to set up a user without an invitation code', async () => {
    const authUser = await env.auth.createUser({})
    await expectError(
      async () => await env.call(setupUser, {}, { uid: authUser.uid }),
      (error) =>
        expect(error).to.have.property('message', 'User is not authenticated'),
    )
  })

  it('correctly sets up a user', async () => {
    const invitation = new Invitation({
      auth: new UserAuth({
        email: 'engagehf-test@stanford.edu',
      }),
      code: 'TESTCODE',
      user: new UserRegistration({
        type: UserType.patient,
        organization: 'stanford',
        receivesAppointmentReminders: true,
        receivesMedicationUpdates: true,
        receivesQuestionnaireReminders: true,
        receivesRecommendationUpdates: true,
        receivesVitalsReminders: true,
        receivesWeightAlerts: true,
      }),
    })
    const invitationRef = env.collections.invitations.doc()
    await invitationRef.set(invitation)

    const expectedAppointment = new FHIRAppointment({
      status: FHIRAppointmentStatus.booked,
      created: new Date('2023-12-24'),
      start: new Date('2023-12-31'),
      end: new Date('2024-01-01'),
      participant: [],
    })

    await env.collections
      .invitationAppointments(invitationRef.id)
      .doc()
      .set(expectedAppointment)

    const expectedObservation = FHIRObservation.createSimple({
      id: '1',
      code: LoincCode.bodyWeight,
      value: 70,
      unit: QuantityUnit.kg,
      date: new Date(),
    })

    await env.collections
      .invitationObservations(
        invitationRef.id,
        UserObservationCollection.bodyWeight,
      )
      .doc()
      .set(expectedObservation)

    const authUser = await env.auth.createUser({})
    await env.call(
      checkInvitationCode,
      { invitationCode: 'TESTCODE' },
      { uid: authUser.uid },
    )

    const actualAuthUser = await env.auth.getUser(authUser.uid)
    expect(actualAuthUser.customClaims?.invitationCode).to.equal('TESTCODE')

    await env.call(
      setupUser,
      {},
      { uid: authUser.uid, token: { invitationCode: 'TESTCODE' } },
    )

    const users = await env.collections.users.get()
    expect(users.docs).to.have.length(1)

    const user = users.docs.at(0)?.data()
    expect(user?.invitationCode).to.equal(invitation.code)
    expect(user?.dateOfEnrollment.getTime()).to.approximately(
      new Date().getTime(),
      2000,
    )

    const actualAppointments = await env.collections
      .userAppointments(authUser.uid)
      .get()
    expect(actualAppointments.docs).to.have.length(1)
    const actualAppointment = actualAppointments.docs.at(0)?.data()
    if (actualAppointment === undefined) {
      expect.fail('actualAppointment is undefined')
    } else {
      expect(
        fhirAppointmentConverter.value.encode(actualAppointment),
      ).to.deep.equal(
        fhirAppointmentConverter.value.encode(expectedAppointment),
      )
    }

    const actualObservations = await env.collections
      .userObservations(authUser.uid, UserObservationCollection.bodyWeight)
      .get()
    expect(actualObservations.docs).to.have.length(1)
    const actualObservation = actualObservations.docs.at(0)?.data()
    if (actualObservation === undefined) {
      expect.fail('actualObservation is undefined')
    } else {
      expect(
        fhirObservationConverter.value.encode(actualObservation),
      ).to.deep.equal(
        fhirObservationConverter.value.encode(expectedObservation),
      )
    }

    const userMessages = await env.collections.userMessages(authUser.uid).get()
    expect(userMessages.docs.length).to.equal(1)
    expect(userMessages.docs.at(0)?.data().type).to.equal(
      UserMessageType.welcome,
    )
  })
})
