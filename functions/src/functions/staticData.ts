import admin from 'firebase-admin'
import { onRequest } from 'firebase-functions/v2/https'
import { RxNormService } from '../services/rxNormService.js'
import { StaticDataService } from '../services/staticDataService.js'

export const rebuildStaticDataFunction = onRequest(async (_, res) => {
  const service = new StaticDataService(
    './data/',
    admin.firestore(),
    new RxNormService(),
  )
  await service.updateAll()
  res.write('Success', 'utf8')
  res.end()
})
