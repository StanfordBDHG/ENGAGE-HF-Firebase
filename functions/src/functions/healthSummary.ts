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
import { Credential, UserRole } from '../services/credential.js'
import { CacheDatabaseService } from '../services/database/cacheDatabaseService.js'
import { type DatabaseService } from '../services/database/databaseService.js'
import { FirestoreService } from '../services/database/firestoreService.js'
import { FhirService } from '../services/fhir/fhirService.js'
import { DefaultHealthSummaryService } from '../services/healthSummary/databaseHealthSummaryService.js'
import { DatabasePatientService } from '../services/patient/databasePatientService.js'
import { DatabaseUserService } from '../services/user/databaseUserService.js'

const exportHealthSummaryInputSchema = z.object({
  userId: z.string(),
})

export const exportHealthSummaryFunction = validatedOnCall(
  exportHealthSummaryInputSchema,
  async (request): Promise<Buffer> => {
    if (!request.data.userId)
      throw new https.HttpsError('invalid-argument', 'User ID is required')

    const databaseService: DatabaseService = new CacheDatabaseService(
      new FirestoreService(),
    )
    const userService = new DatabaseUserService(databaseService)
    const credential = new Credential(request.auth, userService)
    try {
      await credential.checkAny(UserRole.user(request.data.userId))
    } catch {
      const userService = new DatabaseUserService(databaseService)
      const organization = (await userService.getUser(request.data.userId))
        ?.content.organization
      if (!organization)
        throw new https.HttpsError('not-found', 'Organization not found')
      await credential.checkAny(UserRole.clinician(organization))
    }

    const healthSummaryService = new DefaultHealthSummaryService(
      new FhirService(),
      new DatabasePatientService(databaseService),
      new DatabaseUserService(databaseService),
    )
    const data = await healthSummaryService.getHealthSummaryData(
      request.data.userId,
    )
    return generateHealthSummary(data)
  },
)
