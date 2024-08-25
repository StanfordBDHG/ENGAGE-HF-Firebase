//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'
import { checkInvitationCode } from './checkInvitationCode.js'
import { expectError } from '../tests/helpers.js'
import { https } from 'firebase-functions'
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
  UserRegistration,
  UserType,
} from '@stanfordbdhg/engagehf-models'
import { DatabaseConverter } from '../services/database/databaseConverter.js'

describeWithEmulators(
  'function: checkInvitationCode',
  { triggersEnabled: true },
  async (env) => {
    it('should fail if the invitation code does not exist', async () => {
      expectError(
        async () =>
          env.call(
            checkInvitationCode,
            { invitationCode: 'TESTCODE' },
            { uid: 'test' },
          ),
        (error) => {
          expect((error as https.HttpsError).message).to.equal(
            'Error: Invitation not found',
          )
        },
      )
    })

    it('should succeed if invitation code exists', async () => {
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

      await invitationRef
        .collection('appointments')
        .doc()
        .withConverter(new DatabaseConverter(fhirAppointmentConverter.value))
        .set(expectedAppointment)

      const expectedObservation = FHIRObservation.createSimple({
        id: '1',
        code: LoincCode.bodyWeight,
        value: 70,
        unit: QuantityUnit.kg,
        date: new Date(),
      })

      await invitationRef
        .collection('bodyWeightObservations')
        .doc()
        .withConverter(new DatabaseConverter(fhirObservationConverter.value))
        .set(expectedObservation)

      const authUser = await env.auth.createUser({})
      await env.call(
        checkInvitationCode,
        { invitationCode: 'TESTCODE' },
        { uid: authUser.uid },
      )

      const users = await env.collections.users.get()
      expect(users.docs).to.have.length(1)
      const userRef = users.docs.at(0)?.ref
      const user = users.docs.at(0)?.data()
      expect(user?.invitationCode).to.equal(invitation.code)
      expect(user?.dateOfEnrollment.getTime()).to.approximately(
        new Date().getTime(),
        2000,
      )

      const actualAppointments = await userRef?.collection('appointments').get()
      expect(actualAppointments?.docs).to.have.length(1)
      const actualAppointment = actualAppointments?.docs.at(0)?.data()
      expect(actualAppointment?.status).to.equal(FHIRAppointmentStatus.booked)
      expect(actualAppointment?.created).to.equal(expectedAppointment.created)
      expect(actualAppointment?.start).to.equal(expectedAppointment.start)
      expect(actualAppointment?.end).to.equal(expectedAppointment.end)

      const actualObservations = await userRef
        ?.collection('bodyWeightObservations')
        .get()
      expect(actualObservations?.docs).to.have.length(1)
      const actualObservation = actualObservations?.docs.at(0)?.data()
      expect(actualObservation?.code).to.equal(expectedObservation.code)
      expect(actualObservation?.valueQuantity).to.deep.equal(
        expectedObservation.valueQuantity,
      )
      expect(actualObservation?.effectiveDateTime).to.equal(
        expectedObservation.effectiveDateTime,
      )
    })
  },
)
