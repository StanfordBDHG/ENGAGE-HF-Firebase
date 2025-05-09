//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { UserType } from '@stanfordbdhg/engagehf-models'
import { getUsersInformation } from './getUsersInformation.js'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

describeWithEmulators('function: getUsersInformation', (env) => {
  it('should return users information', async () => {
    const adminId = await env.createUser({
      type: UserType.admin,
    })
    const ownerId = await env.createUser({
      type: UserType.owner,
      organization: 'stanford',
    })
    const clinicianId = await env.createUser({
      type: UserType.clinician,
      organization: 'jhu',
    })
    const patientId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
    })

    const adminResult = await env.call(
      getUsersInformation,
      {
        userIds: [adminId, ownerId, clinicianId, patientId],
        includeUserData: true,
      },
      { uid: adminId, token: { type: UserType.admin } },
    )
    expect(Object.keys(adminResult)).toHaveLength(4)
    expect(adminResult[adminId]).toBeDefined()
    expect((adminResult[adminId] as any).data).toBeDefined()
    expect((adminResult[adminId] as any).error).toBeUndefined()
    expect(adminResult[ownerId]).toBeDefined()
    expect((adminResult[ownerId] as any).data).toBeDefined()
    expect((adminResult[ownerId] as any).error).toBeUndefined()
    expect(adminResult[clinicianId]).toBeDefined()
    expect((adminResult[clinicianId] as any).data).toBeDefined()
    expect((adminResult[clinicianId] as any).error).toBeUndefined()
    expect(adminResult[patientId]).toBeDefined()
    expect((adminResult[patientId] as any).data).toBeDefined()
    expect((adminResult[patientId] as any).error).toBeUndefined()

    const ownerResult = await env.call(
      getUsersInformation,
      {
        userIds: [adminId, ownerId, clinicianId, patientId],
        includeUserData: true,
      },
      {
        uid: ownerId,
        token: { type: UserType.owner, organization: 'stanford' },
      },
    )
    expect(Object.keys(ownerResult)).toHaveLength(4)
    expect(ownerResult[adminId]).toBeDefined()
    expect((ownerResult[adminId] as any).data).toBeUndefined()
    expect((ownerResult[adminId] as any).error).toBeDefined()
    expect(ownerResult[ownerId]).toBeDefined()
    expect((ownerResult[ownerId] as any).data).toBeDefined()
    expect((ownerResult[ownerId] as any).error).toBeUndefined()
    expect(ownerResult[clinicianId]).toBeDefined()
    expect((ownerResult[clinicianId] as any).data).toBeUndefined()
    expect((ownerResult[clinicianId] as any).error).toBeDefined()
    expect(ownerResult[patientId]).toBeDefined()
    expect((ownerResult[patientId] as any).data).toBeDefined()
    expect((ownerResult[patientId] as any).error).toBeUndefined()

    const clinicianResult = await env.call(
      getUsersInformation,
      {
        userIds: [adminId, ownerId, clinicianId, patientId],
        includeUserData: true,
      },
      {
        uid: clinicianId,
        token: { type: UserType.clinician, organization: 'jhu' },
      },
    )
    expect(Object.keys(clinicianResult)).toHaveLength(4)
    expect(clinicianResult[adminId]).toBeDefined()
    expect((clinicianResult[adminId] as any).data).toBeUndefined()
    expect((clinicianResult[adminId] as any).error).toBeDefined()
    expect(clinicianResult[ownerId]).toBeDefined()
    expect((clinicianResult[ownerId] as any).data).toBeUndefined()
    expect((clinicianResult[ownerId] as any).error).toBeDefined()
    expect(clinicianResult[clinicianId]).toBeDefined()
    expect((clinicianResult[clinicianId] as any).data).toBeDefined()
    expect((clinicianResult[clinicianId] as any).error).toBeUndefined()
    expect(clinicianResult[patientId]).toBeDefined()
    expect((clinicianResult[patientId] as any).data).toBeUndefined()
    expect((clinicianResult[patientId] as any).error).toBeDefined()

    const patientResult = await env.call(
      getUsersInformation,
      {
        userIds: [adminId, ownerId, clinicianId, patientId],
        includeUserData: true,
      },
      {
        uid: patientId,
        token: { type: UserType.patient, organization: 'stanford' },
      },
    )
    expect(Object.keys(patientResult)).toHaveLength(4)
    expect(patientResult[adminId]).toBeDefined()
    expect((patientResult[adminId] as any).data).toBeUndefined()
    expect((patientResult[adminId] as any).error).toBeDefined()
    expect(patientResult[ownerId]).toBeDefined()
    expect((patientResult[ownerId] as any).data).toBeUndefined()
    expect((patientResult[ownerId] as any).error).toBeDefined()
    expect(patientResult[clinicianId]).toBeDefined()
    expect((patientResult[clinicianId] as any).data).toBeUndefined()
    expect((patientResult[clinicianId] as any).error).toBeDefined()
    expect(patientResult[patientId]).toBeDefined()
    expect((patientResult[patientId] as any).data).toBeDefined()
    expect((patientResult[patientId] as any).error).toBeUndefined()
  })
})
