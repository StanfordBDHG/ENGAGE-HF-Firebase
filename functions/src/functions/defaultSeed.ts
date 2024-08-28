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
import { type z } from 'zod'
import { validatedOnCall, validatedOnRequest } from './helpers.js'
import { _updateStaticData } from './updateStaticData.js'
import { Flags } from '../flags.js'
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'
import { type ServiceFactory } from '../services/factory/serviceFactory.js'

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
        const promises: Array<Promise<void>> = []
        const user = await userService.getUser(userId)
        if (user?.content.type !== UserType.patient) continue
        if (
          data.onlyUserCollections.includes(UserDebugDataComponent.appointments)
        )
          promises.push(
            debugDataService.seedUserAppointments(userId, data.date),
          )
        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.bloodPressureObservations,
          )
        )
          promises.push(
            debugDataService.seedUserBloodPressureObservations(
              userId,
              data.date,
            ),
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.bodyWeightObservations,
          )
        )
          promises.push(
            debugDataService.seedUserBodyWeightObservations(userId, data.date),
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.creatinineObservations,
          )
        )
          promises.push(
            debugDataService.seedUserCreatinineObservations(userId, data.date),
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.dryWeightObservations,
          )
        )
          promises.push(
            debugDataService.seedUserDryWeightObservations(userId, data.date),
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.eGfrObservations,
          )
        )
          promises.push(
            debugDataService.seedUserEgfrObservations(userId, data.date),
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.heartRateObservations,
          )
        )
          promises.push(
            debugDataService.seedUserHeartRateObservations(userId, data.date),
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.potassiumObservations,
          )
        )
          promises.push(
            debugDataService.seedUserPotassiumObservations(userId, data.date),
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.medicationRequests,
          )
        )
          promises.push(debugDataService.seedUserMedicationRequests(userId))

        if (data.onlyUserCollections.includes(UserDebugDataComponent.messages))
          promises.push(debugDataService.seedUserMessages(userId, data.date))
        if (data.onlyUserCollections.includes(UserDebugDataComponent.consent))
          promises.push(debugDataService.seedUserConsent(userId))
        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.medicationRecommendations,
          )
        )
          promises.push(
            triggerService.updateRecommendationsForUser(userId).then(),
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.questionnaireResponses,
          )
        )
          promises.push(
            debugDataService.seedUserQuestionnaireResponses(userId, data.date),
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.symptomScores,
          )
        )
          promises.push(triggerService.updateAllSymptomScores(userId))

        await Promise.all(promises)
      } catch (error) {
        console.error(`Failed to seed user ${userId}: ${String(error)}`)
      }
    }
  }

  for (const userData of data.userData) {
    try {
      const promises: Array<Promise<void>> = []
      if (userData.only.includes(UserDebugDataComponent.appointments))
        promises.push(
          debugDataService.seedUserAppointments(userData.userId, data.date),
        )
      if (userData.only.includes(UserDebugDataComponent.medicationRequests))
        promises.push(
          debugDataService.seedUserMedicationRequests(userData.userId),
        )
      if (userData.only.includes(UserDebugDataComponent.messages))
        promises.push(
          debugDataService.seedUserMessages(userData.userId, data.date),
        )
      if (
        userData.only.includes(UserDebugDataComponent.bloodPressureObservations)
      )
        promises.push(
          debugDataService.seedUserBloodPressureObservations(
            userData.userId,
            data.date,
          ),
        )
      if (userData.only.includes(UserDebugDataComponent.bodyWeightObservations))
        promises.push(
          debugDataService.seedUserBodyWeightObservations(
            userData.userId,
            data.date,
          ),
        )
      if (userData.only.includes(UserDebugDataComponent.creatinineObservations))
        promises.push(
          debugDataService.seedUserCreatinineObservations(
            userData.userId,
            data.date,
          ),
        )
      if (userData.only.includes(UserDebugDataComponent.dryWeightObservations))
        promises.push(
          debugDataService.seedUserDryWeightObservations(
            userData.userId,
            data.date,
          ),
        )
      if (userData.only.includes(UserDebugDataComponent.eGfrObservations))
        promises.push(
          debugDataService.seedUserEgfrObservations(userData.userId, data.date),
        )
      if (userData.only.includes(UserDebugDataComponent.heartRateObservations))
        promises.push(
          debugDataService.seedUserHeartRateObservations(
            userData.userId,
            data.date,
          ),
        )
      if (userData.only.includes(UserDebugDataComponent.potassiumObservations))
        promises.push(
          debugDataService.seedUserPotassiumObservations(
            userData.userId,
            data.date,
          ),
        )
      if (userData.only.includes(UserDebugDataComponent.consent))
        promises.push(debugDataService.seedUserConsent(userData.userId))
      if (
        userData.only.includes(UserDebugDataComponent.medicationRecommendations)
      )
        promises.push(
          triggerService.updateRecommendationsForUser(userData.userId).then(),
        )
      if (userData.only.includes(UserDebugDataComponent.questionnaireResponses))
        promises.push(
          debugDataService.seedUserQuestionnaireResponses(
            userData.userId,
            data.date,
          ),
        )

      if (userData.only.includes(UserDebugDataComponent.symptomScores))
        promises.push(triggerService.updateAllSymptomScores(userData.userId))

      await Promise.all(promises)
    } catch (error) {
      console.error(
        `Failed to seed user data ${userData.userId}: ${String(error)}`,
      )
    }
  }
}

export const defaultSeed =
  Flags.isEmulator ?
    validatedOnRequest(defaultSeedInputSchema, async (_, data, response) => {
      await _defaultSeed(getServiceFactory(), data)
      response.write('Success', 'utf8')
      response.end()
    })
  : validatedOnCall(defaultSeedInputSchema, async (request) => {
      const factory = getServiceFactory()
      factory.credential(request.auth).check(UserRole.admin)
      await _defaultSeed(factory, request.data)
      return 'Success'
    })
