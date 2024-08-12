//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type TypeOf, z } from 'zod'
import { validatedOnCall, validatedOnRequest } from './helpers.js'
import { Flags } from '../flags.js'
import { UserType } from '../models/user.js'
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'
import { type ServiceFactory } from '../services/factory/serviceFactory.js'
import { CachingStrategy } from '../services/seeding/seedingService.js'
import { debug } from 'console'

enum StaticDataComponent {
  medicationClasses = 'medicationClasses',
  medications = 'medications',
  organizations = 'organizations',
  questionnaires = 'questionnaires',
  videoSections = 'videoSections',
}

const updateStaticDataInputSchema = z.object({
  only: z
    .array(z.nativeEnum(StaticDataComponent))
    .default(Object.values(StaticDataComponent)),
  cachingStrategy: z
    .nativeEnum(CachingStrategy)
    .default(CachingStrategy.updateCacheIfNeeded),
})

async function _updateStaticData(
  factory: ServiceFactory,
  input: TypeOf<typeof updateStaticDataInputSchema>,
) {
  const service = factory.staticData()
  const promises: Array<Promise<void>> = []
  if (input.only.includes(StaticDataComponent.medicationClasses))
    promises.push(service.updateMedicationClasses(input.cachingStrategy))
  if (input.only.includes(StaticDataComponent.medications))
    promises.push(service.updateMedications(input.cachingStrategy))
  if (input.only.includes(StaticDataComponent.organizations))
    promises.push(service.updateOrganizations(input.cachingStrategy))
  if (input.only.includes(StaticDataComponent.questionnaires))
    promises.push(service.updateQuestionnaires(input.cachingStrategy))
  if (input.only.includes(StaticDataComponent.videoSections))
    promises.push(service.updateVideoSections(input.cachingStrategy))
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
  date: z.date().default(new Date()),
  only: z
    .nativeEnum(DebugDataComponent)
    .array()
    .default(Object.values(DebugDataComponent)),
  onlyUserCollections: z
    .nativeEnum(UserDebugDataComponent)
    .array()
    .default(Object.values(UserDebugDataComponent)),
  staticData: updateStaticDataInputSchema.optional(),
  userData: z
    .object({
      userId: z.string(),
      only: z
        .nativeEnum(UserDebugDataComponent)
        .array()
        .default(Object.values(UserDebugDataComponent)),
    })
    .array()
    .default([]),
})

async function _defaultSeed(data: TypeOf<typeof defaultSeedInputSchema>) {
  console.log(JSON.stringify(data))
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

const customSeedInputSchema = z.object({
  users: z
    .object({
      auth: z.object({
        uid: z.string().optional(),
        email: z.string(),
        password: z.string(),
      }),
      user: z.any().optional(),
      collections: z.record(z.string(), z.any().array()).default({}),
    })
    .array()
    .default([]),
  firestore: z.record(z.string(), z.any()).default({}),
})

export const customSeed = validatedOnRequest(
  customSeedInputSchema,
  async (_, data, response) => {
    const factory = getServiceFactory()

    await factory.debugData().seedCustom(data)
    response.write('Success', 'utf8')
    response.end()
  },
)
