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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

describeWithEmulators('function: exportHealthSummary', (env) => {
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
})
