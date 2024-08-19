//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { https } from 'firebase-functions/v2'
import { z } from 'zod'
import { validatedOnCall } from './helpers.js'
import { generateHealthSummary } from '../healthSummary/generate.js'
import { optionalish } from '../models/helpers/optionalish.js'
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'
import { QuantityUnit } from '../services/fhir/quantityUnit.js'

const exportHealthSummaryInputSchema = z.object({
  userId: z.string(),
  languages: optionalish(z.array(z.string())),
  weightUnit: optionalish(z.string()),
})

export const exportHealthSummary = validatedOnCall(
  exportHealthSummaryInputSchema,
  async (request): Promise<{ content: string }> => {
    if (!request.data.userId)
      throw new https.HttpsError('invalid-argument', 'User ID is required')

    const factory = getServiceFactory()
    const userService = factory.user()
    const credential = factory.credential(request.auth)
    const user = await userService.getUser(request.data.userId)

    credential.check(
      UserRole.admin,
      UserRole.user(request.data.userId),
      ...(user?.content.organization ?
        [
          UserRole.owner(user.content.organization),
          UserRole.clinician(user.content.organization),
        ]
      : []),
    )

    const weightUnit = [QuantityUnit.lbs, QuantityUnit.kg].find(
      (unit) => unit.code === request.data.weightUnit,
    )

    if (request.data.weightUnit !== undefined && weightUnit === undefined)
      throw new https.HttpsError('invalid-argument', 'Invalid weight unit')

    const healthSummaryService = factory.healthSummary()
    const data = await healthSummaryService.getHealthSummaryData(
      request.data.userId,
      weightUnit ?? QuantityUnit.lbs,
    )
    const pdf = generateHealthSummary(data, {
      languages:
        user?.content.language !== undefined ? [user.content.language] : [],
    })

    return { content: pdf.toString('base64') }
  },
)
