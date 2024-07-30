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
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'
import { type ServiceFactory } from '../services/factory/serviceFactory.js'
import { CachingStrategy } from '../services/seeding/seedingService.js'

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

async function updateStaticData(
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

export const updateStaticDataFunction =
  Flags.isEmulator ?
    validatedOnRequest(
      updateStaticDataInputSchema,
      async (_, data, response) => {
        await updateStaticData(getServiceFactory(), data)
        response.write('Success', 'utf8')
        response.end()
      },
    )
  : validatedOnCall(updateStaticDataInputSchema, async (request) => {
      const factory = getServiceFactory()
      factory.credential(request.auth).check(UserRole.admin)
      await updateStaticData(factory, request.data)
      return 'Success'
    })

enum DebugDataComponent {
  invitations = 'invitations',
  users = 'users',
}

enum UserDebugDataComponent {
  appointments = 'appointments',
  medicationRequests = 'medicationRequests',
  messages = 'messages',
  bodyWeightObservations = 'bodyWeightObservations',
  bloodPressureObservations = 'bloodPressureObservations',
  heartRateObservations = 'heartRateObservations',
  creatinineObservations = 'creatinineObservations',
  eGfrObservations = 'eGfrObservations',
  potassiumObservations = 'potassiumObservations',
  questionnaireResponses = 'questionnaireResponses',
}

const defaultSeedInputSchema = z.object({
  date: z.date().default(new Date()),
  only: z
    .nativeEnum(DebugDataComponent)
    .array()
    .default(Object.values(DebugDataComponent)),
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
    .optional(),
})

export const defaultSeedFunction = validatedOnRequest(
  defaultSeedInputSchema,
  async (request, data, response) => {
    const factory = getServiceFactory()

    if (data.staticData) await updateStaticData(factory, data.staticData)

    const debugDataService = factory.debugData()

    if (data.only.includes(DebugDataComponent.invitations))
      await debugDataService.seedInvitations()

    if (data.only.includes(DebugDataComponent.users))
      await debugDataService.seedUsers()

    for (const userData of data.userData ?? []) {
      if (userData.only.includes(UserDebugDataComponent.appointments))
        await debugDataService.seedUserAppointments(userData.userId, data.date)
      if (userData.only.includes(UserDebugDataComponent.medicationRequests))
        await debugDataService.seedUserMedicationRequests(userData.userId)
      if (userData.only.includes(UserDebugDataComponent.messages))
        await debugDataService.seedUserMessages(userData.userId)
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
    }

    response.write('Success', 'utf8')
    response.end()
  },
)

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

export const customSeedFunction = validatedOnRequest(
  customSeedInputSchema,
  async (request, data, response) => {
    const factory = getServiceFactory()

    await factory.debugData().seedCustom(data)
  },
)
