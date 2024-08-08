//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type DocumentData } from 'firebase-admin/firestore'
import { advanceDateByDays } from '../../extensions/date.js'
import { type FHIRQuestionnaireResponse } from '../../models/fhir/questionnaireResponse.js'
import { type ServiceFactory } from '../factory/serviceFactory.js'
import { type RecommendationInput } from '../recommendation/recommenders/recommender.js'
import { UserDataFactory } from '../seeding/userData/userDataFactory.js'

export class TriggerService {
  private readonly factory: ServiceFactory

  constructor(factory: ServiceFactory) {
    this.factory = factory
  }

  async userEnrolled(userId: string) {
    try {
      await this.updateRecommendationsForUser(userId)
      await this.factory.message().addMessage(
        userId,
        UserDataFactory.welcomeMessage({
          videoReference: 'videoSections/0/videos/0',
        }),
      )
    } catch (error) {
      console.error(
        `Error updating user data for enrollment for user ${userId}: ${String(error)}`,
      )
    }
  }

  async questionnaireResponseWritten(
    userId: string,
    questionnaireResponseId: string,
    data: DocumentData | undefined,
  ) {
    try {
      const patientService = this.factory.patient()
      const symptomScoreCalculator = this.factory.symptomScore()

      await patientService.updateSymptomScore(
        userId,
        questionnaireResponseId,
        data ?
          symptomScoreCalculator.calculate(data as FHIRQuestionnaireResponse)
        : undefined,
      )
    } catch (error) {
      console.error(
        `Error updating symptom scores for questionnaire response ${questionnaireResponseId} for user ${userId}: ${String(error)}`,
      )
    }
  }

  async updateAllSymptomScores(userId: string) {
    try {
      const patientService = this.factory.patient()
      const symptomScores = await patientService.getSymptomScores(
        userId,
        new Date(0),
      )
      for (const symptomScore of symptomScores) {
        await patientService.updateSymptomScore(
          userId,
          symptomScore.id,
          undefined,
        )
      }

      const questionnaireResponses =
        await patientService.getQuestionnaireResponses(userId)
      for (const questionnaireResponse of questionnaireResponses) {
        await this.questionnaireResponseWritten(
          userId,
          questionnaireResponse.id,
          questionnaireResponse.content,
        )
      }
    } catch (error) {
      console.error(
        `Error updating symptom scores for all users: ${String(error)}`,
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
