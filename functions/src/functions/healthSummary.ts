//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { https } from 'firebase-functions/v2'
import { type CallableRequest, onCall } from 'firebase-functions/v2/https'
import { generateHealthSummary } from '../healthSummary/generate.js'
import { CacheDatabaseService } from '../services/database/cacheDatabaseService.js'
import { FirestoreService } from '../services/database/firestoreService.js'
import { FhirService } from '../services/fhir/fhirService.js'
import { DefaultHealthSummaryService } from '../services/healthSummary/databaseHealthSummaryService.js'
import { DatabasePatientService } from '../services/patient/databasePatientService.js'
import { SecurityService } from '../services/securityService.js'
import { DatabaseUserService } from '../services/user/databaseUserService.js'
import { DatabaseService } from '../services/database/databaseService.js'

export interface ExportHealthSummaryInput {
  userId?: string
}

export const exportHealthSummaryFunction = onCall(
  async (request: CallableRequest<ExportHealthSummaryInput>) => {
    if (!request.data.userId)
      throw new https.HttpsError('invalid-argument', 'User ID is required')

    const databaseService: DatabaseService = new CacheDatabaseService(new FirestoreService())
    const securityService = new SecurityService()
    try {
      securityService.ensureUser(request.auth, request.data.userId)
    } catch {
      const userService = new DatabaseUserService(databaseService)
      const organization = (await userService.getUser(request.data.userId))
        ?.content.organization
      if (!organization)
        throw new https.HttpsError('not-found', 'Organization not found')
      await securityService.ensureClinician(request.auth, organization)
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
