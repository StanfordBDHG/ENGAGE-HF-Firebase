//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { UserType } from '@stanfordbdhg/engagehf-models'
import { logger } from 'firebase-functions'
import { exportHealthSummary } from './exportHealthSummary.js'
import { shareHealthSummary } from './shareHealthSummary.js'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'
import { expectError } from '../tests/helpers.js'

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
    expect(healthSummary).toBeDefined()
    expect(healthSummary).toHaveProperty('content')
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
      (error) => expect(error).toHaveProperty('code', 'unauthenticated'),
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
    expect(healthSummary).toBeDefined()
    expect(healthSummary).toHaveProperty('content')
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
    expect(shareCodes3.docs).toHaveLength(1)
    expect(shareCodes3.docs.at(0)?.data()).toHaveProperty('tries', 3)

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
      (error) => expect(error).toHaveProperty('code', 'unauthenticated'),
    )

    const shareCodes2 = await env.collections.userShareCodes(patientId).get()
    expect(shareCodes2.docs).toHaveLength(1)
    expect(shareCodes2.docs.at(0)?.data()).toHaveProperty('tries', 2)

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
      (error) => expect(error).toHaveProperty('code', 'unauthenticated'),
    )

    const shareCodes1 = await env.collections.userShareCodes(patientId).get()
    expect(shareCodes1.docs).toHaveLength(1)
    expect(shareCodes1.docs.at(0)?.data()).toHaveProperty('tries', 1)

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
      (error) => expect(error).toHaveProperty('code', 'unauthenticated'),
    )

    const shareCodes0 = await env.collections.userShareCodes(patientId).get()
    expect(shareCodes0.docs).toHaveLength(0)
  })
})
