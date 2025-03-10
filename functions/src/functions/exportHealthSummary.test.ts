//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { UserType } from '@stanfordbdhg/engagehf-models'
import { expect } from 'chai'
import { logger } from 'firebase-functions'
import { it } from 'mocha'
import { exportHealthSummary } from './exportHealthSummary.js'
import { shareHealthSummary } from './shareHealthSummary.js'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'
import { expectError } from '../tests/helpers.js'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

describeWithEmulators('function: exportHealthSummary', (env) => {
  it('exports health summary for authenticated user', async () => {
    const patientId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
    })

    const healthSummary = await env.call(
      exportHealthSummary,
      { userId: patientId },
      {
        uid: patientId,
        token: { type: UserType.patient, organization: 'stanford' },
      },
    )

    logger.info('healthSummary', healthSummary)
    expect(healthSummary).to.exist
    expect(healthSummary).to.have.property('content')
    expect(healthSummary.content).to.be.a('string')
  })

  it('fails to export health summary for unauthenticated user without share code', async () => {
    const patientId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
    })

    await expectError(
      async () =>
        env.call(
          exportHealthSummary,
          {
            userId: patientId,
          },
          {},
        ),
      (error) => expect(error).to.have.property('code', 'unauthenticated'),
    )
  })

  it('exports health summary for unauthenticated user with share code', async () => {
    const patientId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
    })

    const shareCode = await env.call(
      shareHealthSummary,
      {},
      {
        uid: patientId,
        token: { type: UserType.patient, organization: 'stanford' },
      },
    )

    logger.info('shareCode', shareCode)

    const healthSummary = await env.call(
      exportHealthSummary,
      {
        userId: patientId,
        shareCodeId: shareCode.url.split('/').at(-1),
        shareCode: shareCode.code,
      },
      {},
    )

    logger.info('healthSummary', healthSummary)
    expect(healthSummary).to.exist
    expect(healthSummary).to.have.property('content')
    expect(healthSummary.content).to.be.a('string')
  })

  it('fails to export health summary for unauthenticated user with missing or incorrect share code', async () => {
    const patientId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
    })

    const shareCode = await env.call(
      shareHealthSummary,
      {},
      {
        uid: patientId,
        token: { type: UserType.patient, organization: 'stanford' },
      },
    )

    logger.info('shareCode', shareCode)

    const shareCodes3 = await env.collections.userShareCodes(patientId).get()
    expect(shareCodes3.docs).to.have.lengthOf(1)
    expect(shareCodes3.docs.at(0)?.data()).to.have.property('tries', 3)

    await expectError(
      async () =>
        env.call(
          exportHealthSummary,
          {
            userId: patientId,
            shareCodeId: shareCode.url.split('/').at(-1),
          },
          {},
        ),
      (error) => expect(error).to.have.property('code', 'unauthenticated'),
    )

    const shareCodes2 = await env.collections.userShareCodes(patientId).get()
    expect(shareCodes2.docs).to.have.lengthOf(1)
    expect(shareCodes2.docs.at(0)?.data()).to.have.property('tries', 2)

    await expectError(
      async () =>
        env.call(
          exportHealthSummary,
          {
            userId: patientId,
            shareCodeId: shareCode.url.split('/').at(-1),
            shareCode: 'invalid',
          },
          {},
        ),
      (error) => expect(error).to.have.property('code', 'unauthenticated'),
    )

    const shareCodes1 = await env.collections.userShareCodes(patientId).get()
    expect(shareCodes1.docs).to.have.lengthOf(1)
    expect(shareCodes1.docs.at(0)?.data()).to.have.property('tries', 1)

    await expectError(
      async () =>
        env.call(
          exportHealthSummary,
          {
            userId: patientId,
            shareCodeId: shareCode.url.split('/').at(-1),
          },
          {},
        ),
      (error) => expect(error).to.have.property('code', 'unauthenticated'),
    )

    const shareCodes0 = await env.collections.userShareCodes(patientId).get()
    expect(shareCodes0.docs).to.have.lengthOf(0)
  })
})
