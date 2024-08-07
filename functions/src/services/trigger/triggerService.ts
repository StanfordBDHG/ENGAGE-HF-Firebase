//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { advanceDateByDays } from '../../extensions/date.js'
import { type ServiceFactory } from '../factory/serviceFactory.js'
import { type RecommendationInput } from '../recommendation/recommenders/recommender.js'

export class TriggerService {
  private readonly factory: ServiceFactory

  constructor(factory: ServiceFactory) {
    this.factory = factory
  }

  async userEnrolled(userId: string) {
    try {
      await this.updateRecommendationsForUser(userId)
    } catch (error) {
      console.error(
        `Error updating user data for enrollment for user ${userId}: ${String(error)}`,
      )
    }
  }

  async updateRecommendationsForAllUsers() {
    try {
      const userService = this.factory.user()
      const users = await userService.getAllPatients()

      for (const user of users) {
        await this.updateRecommendationsForUser(user.id)
      }
    } catch (error) {
      console.error(
        `Error updating medication recommendations for all users: ${String(error)}`,
      )
    }
  }

  async updateRecommendationsForUser(userId: string) {
    try {
      const healthSummaryService = this.factory.healthSummary()
      const medicationService = this.factory.medication()
      const patientService = this.factory.patient()
      const recommendationService = this.factory.recommendation()

      const requests = await patientService.getMedicationRequests(userId)
      const contraindications =
        await patientService.getContraindications(userId)

      const vitals = await healthSummaryService.getVitals(
        userId,
        advanceDateByDays(new Date(), -14),
      )

      const latestSymptomScore =
        await patientService.getLatestSymptomScore(userId)

      const requestContexts = await Promise.all(
        requests.map(async (document) =>
          medicationService.getContext(document.content, {
            reference: `users/${userId}/medicationRequests/${document.id}`,
          }),
        ),
      )
      const recommendationInput: RecommendationInput = {
        requests: requestContexts,
        contraindications: contraindications.map(
          (document) => document.content,
        ),
        vitals: vitals,
        latestSymptomScore: latestSymptomScore?.content,
      }

      const recommendations =
        await recommendationService.compute(recommendationInput)

      await patientService.updateMedicationRecommendations(
        userId,
        recommendations,
      )
    } catch (error) {
      console.error(
        `Error updating medication recommendations for user ${userId}: ${String(error)}`,
      )
    }
  }
}
