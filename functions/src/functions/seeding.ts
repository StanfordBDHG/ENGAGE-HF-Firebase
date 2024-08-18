//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { validatedOnCall, validatedOnRequest } from './helpers.js'
import { Flags } from '../flags.js'
import { dateConverter } from '../models/helpers/dateConverter.js'
import { UserType } from '../models/types/userType.js'
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'
import { type ServiceFactory } from '../services/factory/serviceFactory.js'
import { customSeedingOptionsSchema } from '../services/seeding/debugData/debugDataService.js'
import { CachingStrategy } from '../services/seeding/seedingService.js'
import { optionalish } from '../models/helpers/optionalish.js'

enum StaticDataComponent {
  medicationClasses = 'medicationClasses',
  medications = 'medications',
  organizations = 'organizations',
  questionnaires = 'questionnaires',
  videoSections = 'videoSections',
}

const updateStaticDataInputSchema = z.object({
  only: optionalish(z.array(z.nativeEnum(StaticDataComponent))),
  cachingStrategy: optionalish(z.nativeEnum(CachingStrategy)),
})

async function _updateStaticData(
  factory: ServiceFactory,
  input: z.output<typeof updateStaticDataInputSchema>,
) {
  const service = factory.staticData()
  const promises: Array<Promise<void>> = []
  const only = input.only ?? Object.values(StaticDataComponent)
  const cachingStrategy =
    input.cachingStrategy ?? CachingStrategy.updateCacheIfNeeded
  if (only.includes(StaticDataComponent.medicationClasses))
    promises.push(service.updateMedicationClasses(cachingStrategy))
  if (only.includes(StaticDataComponent.medications))
    promises.push(service.updateMedications(cachingStrategy))
  if (only.includes(StaticDataComponent.organizations))
    promises.push(service.updateOrganizations(cachingStrategy))
  if (only.includes(StaticDataComponent.questionnaires))
    promises.push(service.updateQuestionnaires(cachingStrategy))
  if (only.includes(StaticDataComponent.videoSections))
    promises.push(service.updateVideoSections(cachingStrategy))
  await Promise.all(promises)
}

export const updateStaticData =
  Flags.isEmulator ?
    validatedOnRequest(
      updateStaticDataInputSchema,
      async (_, data, response) => {
        await _updateStaticData(getServiceFactory(), data)
        response.write('Success', 'utf8')
        response.end()
      },
    )
  : validatedOnCall(updateStaticDataInputSchema, async (request) => {
      const factory = getServiceFactory()
      factory.credential(request.auth).check(UserRole.admin)
      await _updateStaticData(factory, request.data)
      return 'Success'
    })

enum DebugDataComponent {
  invitations = 'invitations',
  users = 'users',
}

enum UserDebugDataComponent {
  consent = 'consent',
  appointments = 'appointments',
  medicationRecommendations = 'medicationRecommendations',
  medicationRequests = 'medicationRequests',
  messages = 'messages',
  bodyWeightObservations = 'bodyWeightObservations',
  bloodPressureObservations = 'bloodPressureObservations',
  dryWeightObservations = 'dryWeightObservations',
  heartRateObservations = 'heartRateObservations',
  creatinineObservations = 'creatinineObservations',
  eGfrObservations = 'eGfrObservations',
  potassiumObservations = 'potassiumObservations',
  questionnaireResponses = 'questionnaireResponses',
  symptomScores = 'symptomScores',
}

const defaultSeedInputSchema = z.object({
  date: dateConverter.schema.default(new Date().toISOString()),
  only: optionalish(z.nativeEnum(DebugDataComponent).array()),
  onlyUserCollections: optionalish(
    z.nativeEnum(UserDebugDataComponent).array(),
  ),
  staticData: optionalish(updateStaticDataInputSchema),
  userData: optionalish(
    z
      .object({
        userId: z.string(),
        only: optionalish(z.nativeEnum(UserDebugDataComponent).array()),
      })
      .array(),
  ),
})

async function _defaultSeed(data: z.output<typeof defaultSeedInputSchema>) {
  console.log(JSON.stringify(data))
  const factory = getServiceFactory()

  if (!Flags.isEmulator)
    throw factory.credential(undefined).permissionDeniedError()

  if (data.staticData) await _updateStaticData(factory, data.staticData)

  const debugDataService = factory.debugData()
  const triggerService = factory.trigger()

  const only = data.only ?? Object.values(DebugDataComponent)

  if (only.includes(DebugDataComponent.invitations))
    await debugDataService.seedInvitations()

  if (only.includes(DebugDataComponent.users)) {
    const onlyUserCollections =
      data.onlyUserCollections ?? Object.values(UserDebugDataComponent)
    const userIds = await debugDataService.seedUsers()
    const userService = factory.user()

    for (const userId of userIds) {
      try {
        const user = await userService.getUser(userId)
        if (user?.content.type !== UserType.patient) continue
        if (onlyUserCollections.includes(UserDebugDataComponent.appointments))
          await debugDataService.seedUserAppointments(userId, data.date)
        if (
          onlyUserCollections.includes(
            UserDebugDataComponent.bloodPressureObservations,
          )
        )
          await debugDataService.seedUserBloodPressureObservations(
            userId,
            data.date,
          )

        if (
          onlyUserCollections.includes(
            UserDebugDataComponent.bodyWeightObservations,
          )
        )
          await debugDataService.seedUserBodyWeightObservations(
            userId,
            data.date,
          )

        if (
          onlyUserCollections.includes(
            UserDebugDataComponent.creatinineObservations,
          )
        )
          await debugDataService.seedUserCreatinineObservations(
            userId,
            data.date,
          )

        if (
          onlyUserCollections.includes(
            UserDebugDataComponent.dryWeightObservations,
          )
        )
          await debugDataService.seedUserDryWeightObservations(
            userId,
            data.date,
          )

        if (
          onlyUserCollections.includes(UserDebugDataComponent.eGfrObservations)
        )
          await debugDataService.seedUserEgfrObservations(userId, data.date)

        if (
          onlyUserCollections.includes(
            UserDebugDataComponent.heartRateObservations,
          )
        )
          await debugDataService.seedUserHeartRateObservations(
            userId,
            data.date,
          )

        if (
          onlyUserCollections.includes(
            UserDebugDataComponent.potassiumObservations,
          )
        )
          await debugDataService.seedUserPotassiumObservations(
            userId,
            data.date,
          )

        if (
          onlyUserCollections.includes(
            UserDebugDataComponent.medicationRequests,
          )
        )
          await debugDataService.seedUserMedicationRequests(userId)

        if (onlyUserCollections.includes(UserDebugDataComponent.messages))
          await debugDataService.seedUserMessages(userId, data.date)
        if (onlyUserCollections.includes(UserDebugDataComponent.consent))
          await debugDataService.seedUserConsent(userId)
        if (
          onlyUserCollections.includes(
            UserDebugDataComponent.medicationRecommendations,
          )
        )
          await triggerService.updateRecommendationsForUser(userId)

        if (
          onlyUserCollections.includes(
            UserDebugDataComponent.questionnaireResponses,
          )
        )
          await debugDataService.seedUserQuestionnaireResponses(
            userId,
            data.date,
          )

        if (onlyUserCollections.includes(UserDebugDataComponent.symptomScores))
          await triggerService.updateAllSymptomScores(userId)
      } catch (error) {
        console.error(`Failed to seed user ${userId}: ${String(error)}`)
      }
    }
  }

  for (const userData of data.userData ?? []) {
    try {
      const userOnly = userData.only ?? Object.values(UserDebugDataComponent)
      if (userOnly.includes(UserDebugDataComponent.appointments))
        await debugDataService.seedUserAppointments(userData.userId, data.date)
      if (userOnly.includes(UserDebugDataComponent.medicationRequests))
        await debugDataService.seedUserMedicationRequests(userData.userId)
      if (userOnly.includes(UserDebugDataComponent.messages))
        await debugDataService.seedUserMessages(userData.userId, data.date)
      if (userOnly.includes(UserDebugDataComponent.bloodPressureObservations))
        await debugDataService.seedUserBloodPressureObservations(
          userData.userId,
          data.date,
        )
      if (userOnly.includes(UserDebugDataComponent.bodyWeightObservations))
        await debugDataService.seedUserBodyWeightObservations(
          userData.userId,
          data.date,
        )
      if (userOnly.includes(UserDebugDataComponent.creatinineObservations))
        await debugDataService.seedUserCreatinineObservations(
          userData.userId,
          data.date,
        )
      if (userOnly.includes(UserDebugDataComponent.dryWeightObservations))
        await debugDataService.seedUserDryWeightObservations(
          userData.userId,
          data.date,
        )
      if (userOnly.includes(UserDebugDataComponent.eGfrObservations))
        await debugDataService.seedUserEgfrObservations(
          userData.userId,
          data.date,
        )
      if (userOnly.includes(UserDebugDataComponent.heartRateObservations))
        await debugDataService.seedUserHeartRateObservations(
          userData.userId,
          data.date,
        )
      if (userOnly.includes(UserDebugDataComponent.potassiumObservations))
        await debugDataService.seedUserPotassiumObservations(
          userData.userId,
          data.date,
        )
      if (userOnly.includes(UserDebugDataComponent.consent))
        await debugDataService.seedUserConsent(userData.userId)
      if (userOnly.includes(UserDebugDataComponent.medicationRecommendations))
        await triggerService.updateRecommendationsForUser(userData.userId)
      if (userOnly.includes(UserDebugDataComponent.questionnaireResponses))
        await debugDataService.seedUserQuestionnaireResponses(
          userData.userId,
          data.date,
        )

      if (userOnly.includes(UserDebugDataComponent.symptomScores))
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

export const customSeed = validatedOnRequest(
  customSeedingOptionsSchema,
  async (_, data, response) => {
    const factory = getServiceFactory()

    await factory.debugData().seedCustom(data)
    response.write('Success', 'utf8')
    response.end()
  },
)
