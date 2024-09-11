//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  DebugDataComponent,
  defaultSeedInputSchema,
  UserDebugDataComponent,
  UserType,
} from '@stanfordbdhg/engagehf-models'
import { logger } from 'firebase-functions'
import { type z } from 'zod'
import { validatedOnCall, validatedOnRequest } from './helpers.js'
import { _updateStaticData } from './updateStaticData.js'
import { Flags } from '../flags.js'
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'
import { type ServiceFactory } from '../services/factory/serviceFactory.js'
import { type DebugDataService } from '../services/seeding/debugData/debugDataService.js'
import { type TriggerService } from '../services/trigger/triggerService.js'

async function _seedPatientCollections(input: {
  debugData: DebugDataService
  trigger: TriggerService
  userId: string
  components: UserDebugDataComponent[]
  date: Date
}): Promise<void> {
  const promises: Array<Promise<void>> = []
  if (input.components.includes(UserDebugDataComponent.appointments))
    promises.push(
      input.debugData.seedUserAppointments(input.userId, input.date),
    )
  if (
    input.components.includes(UserDebugDataComponent.bloodPressureObservations)
  )
    promises.push(
      input.debugData.seedUserBloodPressureObservations(
        input.userId,
        input.date,
      ),
    )
  if (input.components.includes(UserDebugDataComponent.bodyWeightObservations))
    promises.push(
      input.debugData.seedUserBodyWeightObservations(input.userId, input.date),
    )
  if (input.components.includes(UserDebugDataComponent.creatinineObservations))
    promises.push(
      input.debugData.seedUserCreatinineObservations(input.userId, input.date),
    )
  if (input.components.includes(UserDebugDataComponent.dryWeightObservations))
    promises.push(
      input.debugData.seedUserDryWeightObservations(input.userId, input.date),
    )
  if (input.components.includes(UserDebugDataComponent.eGfrObservations))
    promises.push(
      input.debugData.seedUserEgfrObservations(input.userId, input.date),
    )
  if (input.components.includes(UserDebugDataComponent.heartRateObservations))
    promises.push(
      input.debugData.seedUserHeartRateObservations(input.userId, input.date),
    )
  if (input.components.includes(UserDebugDataComponent.potassiumObservations))
    promises.push(
      input.debugData.seedUserPotassiumObservations(input.userId, input.date),
    )
  if (input.components.includes(UserDebugDataComponent.medicationRequests))
    promises.push(input.debugData.seedUserMedicationRequests(input.userId))
  if (input.components.includes(UserDebugDataComponent.messages))
    promises.push(input.debugData.seedUserMessages(input.userId, input.date))
  if (input.components.includes(UserDebugDataComponent.consent))
    promises.push(input.debugData.seedUserConsent(input.userId))
  if (
    input.components.includes(UserDebugDataComponent.medicationRecommendations)
  )
    promises.push(
      input.trigger.updateRecommendationsForUser(input.userId).then(),
    )
  if (input.components.includes(UserDebugDataComponent.questionnaireResponses))
    promises.push(
      input.debugData.seedUserQuestionnaireResponses(input.userId, input.date),
    )
  if (input.components.includes(UserDebugDataComponent.symptomScores))
    promises.push(input.trigger.updateAllSymptomScores(input.userId))
  await Promise.all(promises)
}

export async function _defaultSeed(
  factory: ServiceFactory,
  data: z.output<typeof defaultSeedInputSchema>,
) {
  if (data.staticData) await _updateStaticData(factory, data.staticData)

  const debugDataService = factory.debugData()
  const triggerService = factory.trigger()

  if (data.only.includes(DebugDataComponent.invitations))
    await debugDataService.seedInvitations()

  if (data.only.includes(DebugDataComponent.users)) {
    const userIds = await debugDataService.seedUsers()
    const userService = factory.user()

    for (const userId of userIds) {
      try {
        const user = await userService.getUser(userId)
        if (user?.content.type !== UserType.patient) continue
        await _seedPatientCollections({
          debugData: debugDataService,
          trigger: triggerService,
          userId,
          components: data.onlyUserCollections,
          date: data.date,
        })
      } catch (error) {
        logger.error(`Failed to seed user ${userId}: ${String(error)}`)
      }
    }
  }

  for (const userData of data.userData) {
    try {
      await _seedPatientCollections({
        debugData: debugDataService,
        trigger: triggerService,
        userId: userData.userId,
        components: userData.only,
        date: data.date,
      })
    } catch (error) {
      logger.error(
        `Failed to seed user data ${userData.userId}: ${String(error)}`,
      )
    }
  }
}

export const defaultSeed =
  Flags.isEmulator ?
    validatedOnRequest(
      'defaultSeed',
      defaultSeedInputSchema,
      async (_, data, response) => {
        await _defaultSeed(getServiceFactory(), data)
        response.write('Success', 'utf8')
        response.end()
      },
    )
  : validatedOnCall('defaultSeed', defaultSeedInputSchema, async (request) => {
      const factory = getServiceFactory()
      factory.credential(request.auth).check(UserRole.admin)
      await _defaultSeed(factory, request.data)
      return 'Success'
    })
