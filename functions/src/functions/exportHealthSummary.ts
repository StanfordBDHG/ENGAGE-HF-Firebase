//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  exportHealthSummaryInputSchema,
  type ExportHealthSummaryOutput,
} from '@stanfordbdhg/engagehf-models'
import { validatedOnCall } from './helpers.js'
import { generateHealthSummary } from '../healthSummary/generate.js'
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const exportHealthSummary = validatedOnCall(
  'exportHealthSummary',
  exportHealthSummaryInputSchema,
  async (request): Promise<ExportHealthSummaryOutput> => {
    const factory = getServiceFactory()

    const userService = factory.user()
    const user = await userService.getUser(request.data.userId)

    try {
      const credential = factory.credential(request.auth)
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
    } catch (error: unknown) {
      if (request.data.shareCodeId !== undefined) {
        const patientService = factory.patient()
        const isValid = await patientService.validateShareCode(
          request.data.userId,
          request.data.shareCodeId,
          request.data.shareCode ?? '',
        )
        if (!isValid) throw error
      } else {
        throw error
      }
    }

    const now = new Date()
    const healthSummaryService = factory.healthSummary()
    const data = await healthSummaryService.getHealthSummaryData(
      request.data.userId,
      now,
      request.data.weightUnit,
    )
    const pdf = generateHealthSummary(data, {
      languages:
        user?.content.language !== undefined ? [user.content.language] : [],
    })

    return { content: pdf.toString('base64') }
  },
)
