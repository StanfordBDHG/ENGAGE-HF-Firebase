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
import { type AuthData } from 'firebase-functions/v2/tasks'
import { Flags } from '../flags.js'
import { Credential, UserRole } from '../services/credential.js'
import { FirestoreService } from '../services/database/firestoreService.js'
import { RxNormService } from '../services/rxNormService.js'
import { StaticDataService } from '../services/staticDataService.js'
import { DatabaseUserService } from '../services/user/databaseUserService.js'

export enum StaticDataComponent {
  medicationClasses = 'medicationClasses',
  medications = 'medications',
  organizations = 'organizations',
  questionnaires = 'questionnaires',
  videoSections = 'videoSections',
}

export interface RebuildStaticDataInput {
  only?: StaticDataComponent[]
}

async function rebuildStaticData(
  authData: AuthData | undefined,
  input: RebuildStaticDataInput,
) {
  if (!Flags.isEmulator) {
    const userService = new DatabaseUserService(new FirestoreService())
    await new Credential(authData, userService).checkAny(UserRole.admin)
  }

  const service = new StaticDataService(admin.firestore(), new RxNormService())
  if (input.only) {
    if (input.only.includes(StaticDataComponent.medicationClasses)) {
      await service.updateMedicationClasses()
    }
    if (input.only.includes(StaticDataComponent.medications)) {
      await service.updateMedications()
    }
    if (input.only.includes(StaticDataComponent.organizations)) {
      await service.updateOrganizations()
    }
    if (input.only.includes(StaticDataComponent.questionnaires)) {
      await service.updateQuestionnaires()
    }
    if (input.only.includes(StaticDataComponent.videoSections)) {
      await service.updateVideoSections()
    }
  } else {
    await service.updateAll()
  }
}

const rebuildStaticDataFunctionProduction = onCall(
  async (request: CallableRequest<RebuildStaticDataInput>) => {
    await rebuildStaticData(request.auth, request.data)
    return 'Success'
  },
)

const rebuildStaticDataFunctionDebug = onRequest(async (request, response) => {
  await rebuildStaticData(
    undefined,
    (request.body ?? {}) as RebuildStaticDataInput,
  )
  response.write('Success', 'utf8')
  response.end()
})

export const rebuildStaticDataFunction =
  Flags.isEmulator ?
    rebuildStaticDataFunctionDebug
  : rebuildStaticDataFunctionProduction
