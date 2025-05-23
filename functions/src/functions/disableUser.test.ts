//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { UserType } from '@stanfordbdhg/engagehf-models'
import { disableUser } from './disableUser.js'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'

describeWithEmulators('function: disableUser', (env) => {
  it('disables an enabled user', async () => {
    const clinicianId = await env.createUser({
      type: UserType.clinician,
      organization: 'stanford',
    })

    const userId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
      clinician: clinicianId,
    })

    const userService = env.factory.user()

    const originalUser = await userService.getUser(userId)
    expect(originalUser).toBeDefined()
    expect(originalUser?.content.claims.disabled).toBe(false)
    expect(originalUser?.content.disabled).toBe(false)

    await env.call(
      disableUser,
      { userId: userId },
      {
        uid: clinicianId,
        token: {
          type: UserType.clinician,
          organization: 'stanford',
          disabled: false,
        },
      },
    )

    const user = await userService.getUser(userId)
    expect(user).toBeDefined()
    expect(user?.content.claims.disabled).toBe(true)
    expect(user?.content.disabled).toBe(true)
  })

  it('keeps disabled users disabled', async () => {
    const clinicianId = await env.createUser({
      type: UserType.clinician,
      organization: 'stanford',
    })

    const userId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
      clinician: clinicianId,
      disabled: true,
    })

    const userService = env.factory.user()

    const originalUser = await userService.getUser(userId)
    expect(originalUser).toBeDefined()
    expect(originalUser?.content.claims.disabled).toBe(true)
    expect(originalUser?.content.disabled).toBe(true)

    await env.call(
      disableUser,
      { userId: userId },
      {
        uid: clinicianId,
        token: {
          type: UserType.clinician,
          organization: 'stanford',
          disabled: false,
        },
      },
    )

    const user = await userService.getUser(userId)
    expect(user).toBeDefined()
    expect(user?.content.claims.disabled).toBe(true)
    expect(user?.content.disabled).toBe(true)
  })
})
