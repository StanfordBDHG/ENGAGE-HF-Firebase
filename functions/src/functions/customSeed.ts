//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { customSeedingOptionsSchema } from '@stanfordbdhg/engagehf-models'
import { validatedOnRequest } from './helpers.js'
import { Flags } from '../flags.js'
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const customSeed = validatedOnRequest(
  customSeedingOptionsSchema,
  async (_, data, response) => {
    const factory = getServiceFactory()

    if (!Flags.isEmulator) factory.credential(undefined).check(UserRole.admin)

    await factory.debugData().seedCustom(data)
    response.write('Success', 'utf8')
    response.end()
  },
)