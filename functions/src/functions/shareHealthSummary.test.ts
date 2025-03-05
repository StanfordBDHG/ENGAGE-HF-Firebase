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
import { shareHealthSummary } from './shareHealthSummary.js'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

describeWithEmulators('function: shareHealthSummary', (env) => {
  it('should create a new share code for patient', async () => {
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
    expect(shareCode).to.exist
    expect(shareCode).to.have.property('code')
    expect(shareCode.code).to.be.a('string')
    expect(shareCode.code).to.have.length(8)
    expect(shareCode).to.have.property('expiresAt')
  })

  it('should create a new share code for clinician', async () => {
    const clinicianId = await env.createUser({
      type: UserType.clinician,
      organization: 'stanford',
    })
    const patientId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
    })

    const shareCode = await env.call(
      shareHealthSummary,
      {
        userId: patientId,
      },
      {
        uid: clinicianId,
        token: { type: UserType.clinician, organization: 'stanford' },
      },
    )

    logger.info('shareCode', shareCode)
    expect(shareCode).to.exist
    expect(shareCode).to.have.property('code')
    expect(shareCode.code).to.be.a('string')
    expect(shareCode.code).to.have.length(8)
    expect(shareCode).to.have.property('expiresAt')
  })
})
