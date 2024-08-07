//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'
import { advanceDateByDays } from '../extensions/date.js'
import { RecommendationInput } from '../services/recommendation/recommenders/recommender.js'

export const onUserAllergyIntoleranceWritten = onDocumentWritten(
  'users/{userId}/allergyIntolerances/{allergyIntoleranceId}',
  async (event) => updateMedicationRecommendations(event.params.userId),
)

export const onUserCreatinineObservationWritten = onDocumentWritten(
  'users/{userId}/creatinineObservations/{observationId}',
  async (event) => updateMedicationRecommendations(event.params.userId),
)

export const onUserBloodPressureObservationWritten = onDocumentWritten(
  'users/{userId}/bodyWeightObservations/{observationId}',
  async (event) => updateMedicationRecommendations(event.params.userId),
)

export const onUserBodyWeightObservationWritten = onDocumentWritten(
  'users/{userId}/bodyWeightObservations/{observationId}',
  async (event) => updateMedicationRecommendations(event.params.userId),
)

export const onUserDryWeightObservationWritten = onDocumentWritten(
  'users/{userId}/dryWeightObservations/{observationId}',
  async (event) => updateMedicationRecommendations(event.params.userId),
)

export const onUserEgfrObservationWritten = onDocumentWritten(
  'users/{userId}/eGfrObservations/{observationId}',
  async (event) => updateMedicationRecommendations(event.params.userId),
)

export const onUserHeartRateObservationWritten = onDocumentWritten(
  'users/{userId}/heartRateObservations/{observationId}',
  async (event) => updateMedicationRecommendations(event.params.userId),
)

export const onUserMedicationRequestWritten = onDocumentWritten(
  'users/{userId}/medicationRequests/{medicationRequestId}',
  async (event) => updateMedicationRecommendations(event.params.userId),
)

export const onUserPotassiumObservationWritten = onDocumentWritten(
  'users/{userId}/potassiumObservations/{observationId}',
  async (event) => updateMedicationRecommendations(event.params.userId),
)

async function updateMedicationRecommendations(userId: string) {
  try {
    const factory = getServiceFactory()
    const patientService = factory.patient()
    const healthSummaryService = factory.healthSummary()
    const medicationService = factory.medication()

    const requests = await patientService.getMedicationRequests(userId)
    const contraindications = await patientService.getContraindications(userId)

    const vitals = await healthSummaryService.getVitals(
      userId,
      advanceDateByDays(new Date(), -14),
    )

    const latestSymptomScore =
      await patientService.getLatestSymptomScore(userId)

    const requestContexts = await Promise.all(
      requests.map(
        async (document) =>
          await medicationService.getContext(document.content, {
            reference: `users/${userId}/medicationRequests/${document.id}`,
          }),
      ),
    )
    const input: RecommendationInput = {
      requests: requestContexts,
      contraindications: contraindications.map((document) => document.content),
      vitals: vitals,
      latestSymptomScore: latestSymptomScore?.content,
    }

    const recommendationService = factory.recommendation()
    const recommendations = await recommendationService.compute(input)

    await patientService.updateMedicationRecommendations(
      userId,
      recommendations,
    )
  } catch (error) {
    console.error(`Error updating medication recommendations: ${String(error)}`)
  }
}
