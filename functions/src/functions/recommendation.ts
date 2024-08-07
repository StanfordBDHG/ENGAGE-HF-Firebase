//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { advanceDateByDays } from '../extensions/date.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'
import { type HealthSummaryService } from '../services/healthSummary/healthSummaryService.js'
import { type MedicationService } from '../services/medication/medicationService.js'
import { type PatientService } from '../services/patient/patientService.js'
import { type RecommendationService } from '../services/recommendation/recommendationService.js'
import { type RecommendationInput } from '../services/recommendation/recommenders/recommender.js'

export const onUserAllergyIntoleranceWritten = onDocumentWritten(
  'users/{userId}/allergyIntolerances/{allergyIntoleranceId}',
  async (event) => updateMedicationRecommendationsForUser(event.params.userId),
)

export const onUserCreatinineObservationWritten = onDocumentWritten(
  'users/{userId}/creatinineObservations/{observationId}',
  async (event) => updateMedicationRecommendationsForUser(event.params.userId),
)

export const onUserBloodPressureObservationWritten = onDocumentWritten(
  'users/{userId}/bodyWeightObservations/{observationId}',
  async (event) => updateMedicationRecommendationsForUser(event.params.userId),
)

export const onUserBodyWeightObservationWritten = onDocumentWritten(
  'users/{userId}/bodyWeightObservations/{observationId}',
  async (event) => updateMedicationRecommendationsForUser(event.params.userId),
)

export const onUserDryWeightObservationWritten = onDocumentWritten(
  'users/{userId}/dryWeightObservations/{observationId}',
  async (event) => updateMedicationRecommendationsForUser(event.params.userId),
)

export const onUserEgfrObservationWritten = onDocumentWritten(
  'users/{userId}/eGfrObservations/{observationId}',
  async (event) => updateMedicationRecommendationsForUser(event.params.userId),
)

export const onUserHeartRateObservationWritten = onDocumentWritten(
  'users/{userId}/heartRateObservations/{observationId}',
  async (event) => updateMedicationRecommendationsForUser(event.params.userId),
)

export const onUserMedicationRequestWritten = onDocumentWritten(
  'users/{userId}/medicationRequests/{medicationRequestId}',
  async (event) => updateMedicationRecommendationsForUser(event.params.userId),
)

export const onUserPotassiumObservationWritten = onDocumentWritten(
  'users/{userId}/potassiumObservations/{observationId}',
  async (event) => updateMedicationRecommendationsForUser(event.params.userId),
)

async function updateMedicationRecommendationsForUser(userId: string) {
  const factory = getServiceFactory()
  await updateMedicationRecommendations({
    userId: userId,
    patientService: factory.patient(),
    healthSummaryService: factory.healthSummary(),
    medicationService: factory.medication(),
    recommendationService: factory.recommendation(),
  })
}

export async function updateMedicationRecommendations(input: {
  patientService: PatientService
  healthSummaryService: HealthSummaryService
  medicationService: MedicationService
  recommendationService: RecommendationService
  userId: string
}) {
  try {
    const requests = await input.patientService.getMedicationRequests(
      input.userId,
    )
    const contraindications = await input.patientService.getContraindications(
      input.userId,
    )

    const vitals = await input.healthSummaryService.getVitals(
      input.userId,
      advanceDateByDays(new Date(), -14),
    )

    const latestSymptomScore = await input.patientService.getLatestSymptomScore(
      input.userId,
    )

    const requestContexts = await Promise.all(
      requests.map(async (document) =>
        input.medicationService.getContext(document.content, {
          reference: `users/${input.userId}/medicationRequests/${document.id}`,
        }),
      ),
    )
    const recommendationInput: RecommendationInput = {
      requests: requestContexts,
      contraindications: contraindications.map((document) => document.content),
      vitals: vitals,
      latestSymptomScore: latestSymptomScore?.content,
    }

    const recommendations =
      await input.recommendationService.compute(recommendationInput)

    await input.patientService.updateMedicationRecommendations(
      input.userId,
      recommendations,
    )
  } catch (error) {
    console.error(
      `Error updating medication recommendations for user ${input.userId}: ${String(error)}`,
    )
  }
}
