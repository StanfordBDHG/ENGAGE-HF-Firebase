//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { UserType } from '@stanfordbdhg/engagehf-models'
import { MockPhoneService } from '../services/message/phone/phoneService.mock.js'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'
import {
  checkPhoneNumberVerification,
  deletePhoneNumber,
  startPhoneNumberVerification,
} from './phoneNumber.js'
import { expect } from 'chai'
import { expectError } from '../tests/helpers.js'

describeWithEmulators('PhoneNumber', (env) => {
  it('verifies phone number successfully', async () => {
    const phoneNumber = '+15555555555'
    const patientId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
    })

    const verifications0 = await env.collections
      .userPhoneNumberVerifications(patientId)
      .get()
    expect(verifications0.docs).to.have.length(0)

    await env.call(
      startPhoneNumberVerification,
      { phoneNumber },
      {
        uid: patientId,
        token: { type: UserType.patient, organization: 'stanford' },
      },
    )

    const verifications1 = await env.collections
      .userPhoneNumberVerifications(patientId)
      .where('phoneNumber', '==', phoneNumber)
      .get()
    expect(verifications1.docs).to.have.length(1)
    const verification1 = verifications1.docs[0].data()
    expect(verification1.phoneNumber).to.equal(phoneNumber)

    await env.call(
      checkPhoneNumberVerification,
      { phoneNumber, code: MockPhoneService.correctCode },
      {
        uid: patientId,
        token: { type: UserType.patient, organization: 'stanford' },
      },
    )

    const verifications2 = await env.collections
      .userPhoneNumberVerifications(patientId)
      .get()
    expect(verifications2.docs).to.have.length(0)

    const user = await env.collections.users.doc(patientId).get()
    expect(user.data()?.phoneNumbers).to.contain(phoneNumber)
  })

  it('fails to verify phone number without calling startPhoneNumberVerification', async () => {
    const phoneNumber = '+15555555555'
    const patientId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
    })

    await expectError(
      async () =>
        env.call(
          checkPhoneNumberVerification,
          { phoneNumber, code: MockPhoneService.correctCode },
          {
            uid: patientId,
            token: { type: UserType.patient, organization: 'stanford' },
          },
        ),
      (error) =>
        expect(error).to.have.property(
          'message',
          'Phone verification not found.',
        ),
    )
  })

  it('fails to verify phone number with incorrect code', async () => {
    const phoneNumber = '+15551234567'
    const patientId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
    })

    await env.call(
      startPhoneNumberVerification,
      { phoneNumber },
      {
        uid: patientId,
        token: { type: UserType.patient, organization: 'stanford' },
      },
    )

    await expectError(
      async () =>
        env.call(
          checkPhoneNumberVerification,
          { phoneNumber, code: MockPhoneService.incorrectCode },
          {
            uid: patientId,
            token: { type: UserType.patient, organization: 'stanford' },
          },
        ),
      (error) =>
        expect(error).to.have.property('message', 'Invalid verification code'),
    )
  })

  it('deletes an existing phone number successfully', async () => {
    const phoneNumber0 = '+15555555555'
    const phoneNumber1 = '+15551234567'
    const patientId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
      phoneNumbers: [phoneNumber0, phoneNumber1],
    })

    await env.call(
      deletePhoneNumber,
      { phoneNumber: phoneNumber0 },
      {
        uid: patientId,
        token: { type: UserType.patient, organization: 'stanford' },
      },
    )

    const user = await env.collections.users.doc(patientId).get()
    const userData = user?.data()
    expect(userData?.phoneNumbers).to.not.contain(phoneNumber0)
    expect(userData?.phoneNumbers).to.contain(phoneNumber1)
    expect(userData?.phoneNumbers).to.have.length(1)
  })
})
