//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const onScheduleUpdateMedicationRecommendations = onSchedule(
  'every 24 hours',
  async () => getServiceFactory().trigger().updateRecommendationsForAllUsers(),
)

export const onUserAllergyIntoleranceWritten = onDocumentWritten(
  'users/{userId}/allergyIntolerances/{allergyIntoleranceId}',
  async (event) =>
    getServiceFactory()
      .trigger()
      .updateRecommendationsForUser(event.params.userId),
)

export const onUserCreatinineObservationWritten = onDocumentWritten(
  'users/{userId}/creatinineObservations/{observationId}',
  async (event) =>
    getServiceFactory()
      .trigger()
      .updateRecommendationsForUser(event.params.userId),
)

export const onUserBloodPressureObservationWritten = onDocumentWritten(
  'users/{userId}/bodyWeightObservations/{observationId}',
  async (event) =>
    getServiceFactory()
      .trigger()
      .updateRecommendationsForUser(event.params.userId),
)

export const onUserBodyWeightObservationWritten = onDocumentWritten(
  'users/{userId}/bodyWeightObservations/{observationId}',
  async (event) => {
    const triggerService = getServiceFactory().trigger()

    await Promise.all([
      triggerService.updateRecommendationsForUser(event.params.userId),
      triggerService.userBodyWeightObservationWritten(event.params.userId),
    ])
  },
)

export const onUserDryWeightObservationWritten = onDocumentWritten(
  'users/{userId}/dryWeightObservations/{observationId}',
  async (event) =>
    getServiceFactory()
      .trigger()
      .updateRecommendationsForUser(event.params.userId),
)

export const onUserEgfrObservationWritten = onDocumentWritten(
  'users/{userId}/eGfrObservations/{observationId}',
  async (event) =>
    getServiceFactory()
      .trigger()
      .updateRecommendationsForUser(event.params.userId),
)

export const onUserHeartRateObservationWritten = onDocumentWritten(
  'users/{userId}/heartRateObservations/{observationId}',
  async (event) =>
    getServiceFactory()
      .trigger()
      .updateRecommendationsForUser(event.params.userId),
)

export const onUserMedicationRequestWritten = onDocumentWritten(
  'users/{userId}/medicationRequests/{medicationRequestId}',
  async (event) =>
    getServiceFactory()
      .trigger()
      .updateRecommendationsForUser(event.params.userId),
)

export const onUserPotassiumObservationWritten = onDocumentWritten(
  'users/{userId}/potassiumObservations/{observationId}',
  async (event) =>
    getServiceFactory()
      .trigger()
      .updateRecommendationsForUser(event.params.userId),
)
