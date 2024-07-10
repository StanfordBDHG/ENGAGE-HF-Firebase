//
// This source file is part of the ENGAGE-HF based on the Stanford Spezi Template Application project
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
import { HealthSummaryService } from '../services/healthSummaryService.js'

export interface ExportHealthSummaryInput {
  userId?: string
}

export const exportHealthSummaryFunction = onCall(
  async (request: CallableRequest<ExportHealthSummaryInput>) => {
    if (!request.data.userId)
      throw new https.HttpsError('invalid-argument', 'User ID is required')

    const service = new HealthSummaryService(
      new CacheDatabaseService(new FirestoreService()),
      new FhirService(),
    )
    const data = await service.fetchHealthSummaryData(request.data.userId)
    return generateHealthSummary(data)
  },
)
