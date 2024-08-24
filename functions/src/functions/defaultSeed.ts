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
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

async function _defaultSeed(data: z.output<typeof defaultSeedInputSchema>) {
  const factory = getServiceFactory()

  if (!Flags.isEmulator)
    throw factory.credential(undefined).permissionDeniedError()

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
        if (
          data.onlyUserCollections.includes(UserDebugDataComponent.appointments)
        )
          await debugDataService.seedUserAppointments(userId, data.date)
        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.bloodPressureObservations,
          )
        )
          await debugDataService.seedUserBloodPressureObservations(
            userId,
            data.date,
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.bodyWeightObservations,
          )
        )
          await debugDataService.seedUserBodyWeightObservations(
            userId,
            data.date,
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.creatinineObservations,
          )
        )
          await debugDataService.seedUserCreatinineObservations(
            userId,
            data.date,
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.dryWeightObservations,
          )
        )
          await debugDataService.seedUserDryWeightObservations(
            userId,
            data.date,
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.eGfrObservations,
          )
        )
          await debugDataService.seedUserEgfrObservations(userId, data.date)

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.heartRateObservations,
          )
        )
          await debugDataService.seedUserHeartRateObservations(
            userId,
            data.date,
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.potassiumObservations,
          )
        )
          await debugDataService.seedUserPotassiumObservations(
            userId,
            data.date,
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.medicationRequests,
          )
        )
          await debugDataService.seedUserMedicationRequests(userId)

        if (data.onlyUserCollections.includes(UserDebugDataComponent.messages))
          await debugDataService.seedUserMessages(userId, data.date)
        if (data.onlyUserCollections.includes(UserDebugDataComponent.consent))
          await debugDataService.seedUserConsent(userId)
        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.medicationRecommendations,
          )
        )
          await triggerService.updateRecommendationsForUser(userId)

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.questionnaireResponses,
          )
        )
          await debugDataService.seedUserQuestionnaireResponses(
            userId,
            data.date,
          )

        if (
          data.onlyUserCollections.includes(
            UserDebugDataComponent.symptomScores,
          )
        )
          await triggerService.updateAllSymptomScores(userId)
      } catch (error) {
        console.error(`Failed to seed user ${userId}: ${String(error)}`)
      }
    }
  }

  for (const userData of data.userData) {
    try {
      if (userData.only.includes(UserDebugDataComponent.appointments))
        await debugDataService.seedUserAppointments(userData.userId, data.date)
      if (userData.only.includes(UserDebugDataComponent.medicationRequests))
        await debugDataService.seedUserMedicationRequests(userData.userId)
      if (userData.only.includes(UserDebugDataComponent.messages))
        await debugDataService.seedUserMessages(userData.userId, data.date)
      if (
        userData.only.includes(UserDebugDataComponent.bloodPressureObservations)
      )
        await debugDataService.seedUserBloodPressureObservations(
          userData.userId,
          data.date,
        )
      if (userData.only.includes(UserDebugDataComponent.bodyWeightObservations))
        await debugDataService.seedUserBodyWeightObservations(
          userData.userId,
          data.date,
        )
      if (userData.only.includes(UserDebugDataComponent.creatinineObservations))
        await debugDataService.seedUserCreatinineObservations(
          userData.userId,
          data.date,
        )
      if (userData.only.includes(UserDebugDataComponent.dryWeightObservations))
        await debugDataService.seedUserDryWeightObservations(
          userData.userId,
          data.date,
        )
      if (userData.only.includes(UserDebugDataComponent.eGfrObservations))
        await debugDataService.seedUserEgfrObservations(
          userData.userId,
          data.date,
        )
      if (userData.only.includes(UserDebugDataComponent.heartRateObservations))
        await debugDataService.seedUserHeartRateObservations(
          userData.userId,
          data.date,
        )
      if (userData.only.includes(UserDebugDataComponent.potassiumObservations))
        await debugDataService.seedUserPotassiumObservations(
          userData.userId,
          data.date,
        )
      if (userData.only.includes(UserDebugDataComponent.consent))
        await debugDataService.seedUserConsent(userData.userId)
      if (
        userData.only.includes(UserDebugDataComponent.medicationRecommendations)
      )
        await triggerService.updateRecommendationsForUser(userData.userId)
      if (userData.only.includes(UserDebugDataComponent.questionnaireResponses))
        await debugDataService.seedUserQuestionnaireResponses(
          userData.userId,
          data.date,
        )

      if (userData.only.includes(UserDebugDataComponent.symptomScores))
        await triggerService.updateAllSymptomScores(userData.userId)
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
      await _defaultSeed(data)
      response.write('Success', 'utf8')
      response.end()
    })
  : validatedOnCall(defaultSeedInputSchema, async (request) => {
      await _defaultSeed(request.data)
      return 'Success'
    })
