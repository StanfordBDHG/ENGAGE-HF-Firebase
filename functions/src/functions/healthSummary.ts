import { https } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'
import { generateHealthSummary } from '../healthSummary/generate.js'
import { CacheDatabaseService } from '../services/database/cacheDatabaseService.js'
import { FirestoreService } from '../services/database/firestoreService.js'
import { FhirService } from '../services/fhirService.js'
import { HealthSummaryService } from '../services/healthSummaryService.js'

interface ExportHealthSummaryInput {
  userId?: string
}

export const exportHealthSummaryFunction = onRequest(async (req, res) => {
  const body = req.body as ExportHealthSummaryInput | undefined
  if (!body?.userId)
    throw new https.HttpsError('invalid-argument', 'User ID is required')

  const service = new HealthSummaryService(
    new FhirService(),
    new CacheDatabaseService(new FirestoreService()),
  )
  const data = await service.fetchHealthSummaryData(body.userId)
  const result = generateHealthSummary(data)
  res.write(result, 'utf8')
  res.end()
})
