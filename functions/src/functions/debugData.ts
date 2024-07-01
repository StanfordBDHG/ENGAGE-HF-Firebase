import admin from 'firebase-admin'
import { onRequest } from 'firebase-functions/v2/https'
import { RxNormService } from '../services/rxNormService.js'
import { StaticDataService } from '../services/staticDataService.js'

export const buildDebugDataFunction = onRequest(async (_, res) => {
  const firestore = admin.firestore()
  res.write('Success', 'utf8')
  res.end()
})
