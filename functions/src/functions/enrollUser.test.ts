//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

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
  UserObservationCollection,
  QuestionnaireReference,
} from '@stanfordbdhg/engagehf-models'
import { enrollUser } from './enrollUser.js'
import { QuestionnaireId } from '../services/seeding/staticData/questionnaireFactory/questionnaireLinkIds.js'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'
import { expectError } from '../tests/helpers.js'

describeWithEmulators('function: enrollUser', (env) => {
  it('fails to enroll a user without an invitation code', async () => {
    const authUser = await env.auth.createUser({})
    await expectError(
      async () =>
        env.call(
          enrollUser,
          { invitationCode: 'TESTCODE' },
          { uid: authUser.uid },
        ),
      (error) => expect(error).toHaveProperty('code', 'not-found'),
    )
  })

  it('correctly enrolls a clinician-managed user', async () => {
    const invitation = new Invitation({
      auth: new UserAuth({
        email: 'engagehf-test@stanford.edu',
      }),
      code: 'TESTCODE',
      user: new UserRegistration({
        type: UserType.patient,
        disabled: false,
        selfManaged: false,
        organization: 'stanford',
        receivesAppointmentReminders: true,
        receivesInactivityReminders: true,
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
      enrollUser,
      { invitationCode: 'TESTCODE' },
      { uid: authUser.uid },
    )

    const userService = env.factory.user()
    const dbUser = await userService.getUser(authUser.uid)
    expect(dbUser).toBeDefined()
    if (dbUser !== undefined) await userService.finishUserEnrollment(dbUser)

    const users = await env.collections.users.get()
    expect(users.docs).toHaveLength(1)

    const user = users.docs.at(0)?.data()
    expect(user?.invitationCode).toBe(invitation.code)
    expect(user?.dateOfEnrollment.getTime()).toBeCloseTo(
      new Date().getTime(),
      -4,
    )

    const actualAppointments = await env.collections
      .userAppointments(authUser.uid)
      .get()
    expect(actualAppointments.docs).toHaveLength(1)
    const actualAppointment = actualAppointments.docs.at(0)?.data()
    if (actualAppointment === undefined) {
      fail('actualAppointment is undefined')
    } else {
      expect(
        fhirAppointmentConverter.value.encode(actualAppointment),
      ).toStrictEqual(
        fhirAppointmentConverter.value.encode(expectedAppointment),
      )
    }

    const actualObservations = await env.collections
      .userObservations(authUser.uid, UserObservationCollection.bodyWeight)
      .get()
    expect(actualObservations.docs).toHaveLength(1)
    const actualObservation = actualObservations.docs.at(0)?.data()
    if (actualObservation === undefined) {
      fail('actualObservation is undefined')
    } else {
      expect(
        fhirObservationConverter.value.encode(actualObservation),
      ).toStrictEqual(
        fhirObservationConverter.value.encode(expectedObservation),
      )
    }

    const userMessages = await env.collections.userMessages(authUser.uid).get()
    expect(userMessages.docs).toHaveLength(2)
    expect(
      userMessages.docs.find(
        (message) => message.data().type == UserMessageType.welcome,
      ),
    ).toBeDefined()
    expect(
      userMessages.docs.find(
        (message) =>
          message.data().type == UserMessageType.symptomQuestionnaire,
      ),
    ).toBeDefined()
  })

  it('correctly enrolls a self-managed user', async () => {
    const invitation = new Invitation({
      auth: new UserAuth({
        email: 'engagehf-test@stanford.edu',
      }),
      code: 'TESTCODE',
      user: new UserRegistration({
        type: UserType.patient,
        disabled: false,
        selfManaged: true,
        organization: 'stanford',
        receivesAppointmentReminders: true,
        receivesInactivityReminders: true,
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
      enrollUser,
      { invitationCode: 'TESTCODE' },
      { uid: authUser.uid },
    )

    const userService = env.factory.user()
    const dbUser = await userService.getUser(authUser.uid)
    expect(dbUser).toBeDefined()
    if (dbUser !== undefined) await userService.finishUserEnrollment(dbUser)

    const users = await env.collections.users.get()
    expect(users.docs).toHaveLength(1)

    const user = users.docs.at(0)?.data()
    expect(user?.invitationCode).toBe(invitation.code)
    expect(user?.dateOfEnrollment.getTime()).toBeCloseTo(
      new Date().getTime(),
      -4,
    )

    const actualAppointments = await env.collections
      .userAppointments(authUser.uid)
      .get()
    expect(actualAppointments.docs).toHaveLength(1)
    const actualAppointment = actualAppointments.docs.at(0)?.data()
    if (actualAppointment === undefined) {
      fail('actualAppointment is undefined')
    } else {
      expect(
        fhirAppointmentConverter.value.encode(actualAppointment),
      ).toStrictEqual(
        fhirAppointmentConverter.value.encode(expectedAppointment),
      )
    }

    const actualObservations = await env.collections
      .userObservations(authUser.uid, UserObservationCollection.bodyWeight)
      .get()
    expect(actualObservations.docs).toHaveLength(1)
    const actualObservation = actualObservations.docs.at(0)?.data()
    if (actualObservation === undefined) {
      fail('actualObservation is undefined')
    } else {
      expect(
        fhirObservationConverter.value.encode(actualObservation),
      ).toStrictEqual(
        fhirObservationConverter.value.encode(expectedObservation),
      )
    }

    const userMessages = await env.collections.userMessages(authUser.uid).get()
    expect(userMessages.docs).toHaveLength(3)
    const userMessagesData = userMessages.docs.map((doc) => doc.data())
    const welcomeMessage = userMessagesData.find(
      (message) => message.type == UserMessageType.welcome,
    )
    expect(welcomeMessage).toBeDefined()
    const symptomQuestionnaireMessage = userMessagesData.find(
      (message) => message.type == UserMessageType.symptomQuestionnaire,
    )
    expect(symptomQuestionnaireMessage).toBeDefined()
    const registrationQuestionnaireMessage = userMessagesData.find(
      (message) => message.type == UserMessageType.registrationQuestionnaire,
    )
    expect(registrationQuestionnaireMessage).toBeDefined()
    expect(registrationQuestionnaireMessage?.action).toBe(
      QuestionnaireReference.registration_en_US,
    )
  })
})
