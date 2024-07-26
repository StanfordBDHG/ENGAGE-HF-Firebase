//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type AuthData } from 'firebase-functions/v2/tasks'
import { type TypeOf, z } from 'zod'
import { validatedOnCall, validatedOnRequest } from './helpers.js'
import { Flags } from '../flags.js'
import { Credential, UserRole } from '../services/credential.js'
import { type DatabaseService } from '../services/database/databaseService.js'
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

const rebuildStaticDataInputSchema = z.object({
  only: z.array(z.nativeEnum(StaticDataComponent)).optional(),
})

async function rebuildStaticData(
  authData: AuthData | undefined,
  input: TypeOf<typeof rebuildStaticDataInputSchema>,
) {
  const databaseService: DatabaseService = new FirestoreService()

  if (!Flags.isEmulator) {
    const userService = new DatabaseUserService(databaseService)
    await new Credential(authData, userService).checkAny(UserRole.admin)
  }

  const service = new StaticDataService(databaseService, new RxNormService())
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

const rebuildStaticDataFunctionProduction = validatedOnCall(
  rebuildStaticDataInputSchema,
  async (request): Promise<void> => {
    await rebuildStaticData(request.auth, request.data)
  },
)

const rebuildStaticDataFunctionDebug = validatedOnRequest(
  rebuildStaticDataInputSchema,
  async (_, data, response) => {
    await rebuildStaticData(undefined, data)
    response.write('Success', 'utf8')
    response.end()
  },
)

export const rebuildStaticDataFunction =
  Flags.isEmulator ?
    rebuildStaticDataFunctionDebug
  : rebuildStaticDataFunctionProduction
