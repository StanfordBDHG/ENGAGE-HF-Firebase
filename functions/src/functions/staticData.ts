import admin from 'firebase-admin'
import { CallableRequest, onCall, onRequest } from 'firebase-functions/v2/https'
import { RxNormService } from '../services/rxNormService.js'
import { StaticDataService } from '../services/staticDataService.js'

const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true'

async function rebuildStaticData(userId: string | undefined) {
  if (!isEmulator) {
    if (!userId)
      throw new Error('User is not properly authenticated')
  
    const user = await admin.auth().getUser(userId)
    if (!user.customClaims?.admin)
      throw new Error('User is not an admin')
  }
  const service = new StaticDataService(
    './data/',
    admin.firestore(),
    new RxNormService(),
  )
  await service.updateAll()
}

const rebuildStaticDataFunctionProduction = onCall(async (request: CallableRequest<void>) => {
  await rebuildStaticData(request.auth?.uid)
  return 'Success'
})


const rebuildStaticDataFunctionDebug = onRequest(async (_, response) => {
  await rebuildStaticData(undefined)
  response.write('Success', 'utf8')
  response.end()
})

export const rebuildStaticDataFunction = isEmulator ? rebuildStaticDataFunctionDebug : rebuildStaticDataFunctionProduction