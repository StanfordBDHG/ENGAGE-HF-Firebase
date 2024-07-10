//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import admin from 'firebase-admin'
import {
  type CallableRequest,
  onCall,
  onRequest,
} from 'firebase-functions/v2/https'
import { Flags } from '../flags.js'
import { RxNormService } from '../services/rxNormService.js'
import { StaticDataService } from '../services/staticDataService.js'
import { ClaimsService } from '../services/claimsService.js'

async function rebuildStaticData(userId: string | undefined) {
  if (!Flags.isEmulator) {
    if (!userId) throw new Error('User is not properly authenticated')
    
    const claimsService = new ClaimsService()
    await claimsService.ensureAdmin(userId)
  }
  const service = new StaticDataService(admin.firestore(), new RxNormService())
  await service.updateAll()
}

const rebuildStaticDataFunctionProduction = onCall(
  async (request: CallableRequest<void>) => {
    await rebuildStaticData(request.auth?.uid)
    return 'Success'
  },
)

const rebuildStaticDataFunctionDebug = onRequest(async (_, response) => {
  await rebuildStaticData(undefined)
  response.write('Success', 'utf8')
  response.end()
})

export const rebuildStaticDataFunction =
  Flags.isEmulator ?
    rebuildStaticDataFunctionDebug
  : rebuildStaticDataFunctionProduction
