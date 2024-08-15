//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { median } from '../../extensions/array.js'
import {
  advanceDateByDays,
  advanceDateByMinutes,
} from '../../extensions/date.js'
import {
  FHIRQuestionnaireResponse,
  fhirQuestionnaireResponseConverter,
} from '../../models/fhir/fhirQuestionnaireResponse.js'
import { UserMessage, UserMessageType } from '../../models/types/userMessage.js'
import { type ServiceFactory } from '../factory/serviceFactory.js'
import { QuantityUnit } from '../fhir/quantityUnit.js'
import { type RecommendationInput } from '../recommendation/recommenders/recommender.js'
import { QuestionnaireReference, VideoReference } from '../references.js'
import {
  UserMedicationRecommendation,
  UserMedicationRecommendationType,
} from '../../models/types/userMedicationRecommendation.js'
import { UserObservationCollection } from '../database/collections.js'

export class TriggerService {
  // Properties

  private readonly factory: ServiceFactory

  // Constructor

  constructor(factory: ServiceFactory) {
    this.factory = factory
  }

  // Methods - Schedule

  async every15Minutes() {
    try {
      const now = new Date()
      const tomorrow = advanceDateByDays(now, 1)
      const yesterday = advanceDateByDays(now, -1)
      const patientService = this.factory.patient()
      const messageService = this.factory.message()

      const upcomingAppointments = await patientService.getEveryAppoinment(
        advanceDateByMinutes(tomorrow, -15),
        advanceDateByMinutes(tomorrow, 15),
      )

      await Promise.all(
        upcomingAppointments.map(async (appointment) =>
          messageService.addMessage(
            appointment.path.split('/')[1],
            UserMessage.createPreAppointment({
              appointmentId: appointment.id,
            }),
          ),
        ),
      )

      const pastAppointments = await patientService.getEveryAppoinment(
        advanceDateByMinutes(yesterday, -15),
        advanceDateByMinutes(yesterday, 15),
      )

      await Promise.all(
        pastAppointments.map(async (appointment) =>
          messageService.completeMessages(
            appointment.path.split('/')[1],
            UserMessageType.preAppointment,
            (message) => message.appointmentId === appointment.id,
          ),
        ),
      )
    } catch (error) {
      console.error(`Error running every 15 minutes trigger: ${String(error)}`)
    }
  }

  async everyMorning() {
    try {
      const messageService = this.factory.message()
      const users = await this.factory.user().getAllPatients()

      const symptomReminderMessage = UserMessage.createSymptomQuestionnaire({
        questionnaireReference: QuestionnaireReference.enUS,
      })
      const vitalsMessage = UserMessage.createVitals()

      await Promise.all(
        users.map(async (user) => {
          try {
            await messageService.addMessage(user.id, vitalsMessage)
            await messageService.sendNotification(user.id, vitalsMessage, {
              language: user.content.language ?? undefined,
            })

            const enrollmentDate = user.content.dateOfEnrollment
            const durationOfOneDayInMilliseconds = 24 * 60 * 60 * 1000
            if (
              enrollmentDate.getTime() % (durationOfOneDayInMilliseconds * 14) <
              durationOfOneDayInMilliseconds
            ) {
              await messageService.addMessage(user.id, symptomReminderMessage)
              await messageService.sendNotification(
                user.id,
                symptomReminderMessage,
                { language: user.content.language ?? undefined },
              )
            }

            if (
              advanceDateByDays(enrollmentDate, -2).getTime() %
                (durationOfOneDayInMilliseconds * 14) <
              durationOfOneDayInMilliseconds
            ) {
              await this.addMedicationUptitrationMessageIfNeeded({
                userId: user.id,
                recommendations: undefined, // Probably need to get recommendations, right?
              })
            }
          } catch (error) {
            console.error(
              `Error running every morning trigger for user ${user.id}: ${String(error)}`,
            )
          }
        }),
      )
    } catch (error) {
      console.error(`Error running every morning trigger: ${String(error)}`)
    }
  }

  // Methods - Triggers

  async questionnaireResponseWritten(
    userId: string,
    questionnaireResponseId: string,
    beforeData: FHIRQuestionnaireResponse | undefined,
    afterData: FHIRQuestionnaireResponse | undefined,
  ) {
    try {
      const patientService = this.factory.patient()
      const symptomScoreCalculator = this.factory.symptomScore()

      await patientService.updateSymptomScore(
        userId,
        questionnaireResponseId,
        afterData ?
          symptomScoreCalculator.calculate(
            fhirQuestionnaireResponseConverter.value.schema.parse(
              afterData,
            ) as FHIRQuestionnaireResponse,
          )
        : undefined,
      )

      const messageService = this.factory.message()
      if (beforeData === undefined && afterData !== undefined) {
        await messageService.completeMessages(
          userId,
          UserMessageType.symptomQuestionnaire,
        )
      }

      const recommendations = await this.updateRecommendationsForUser(userId)

      const hasImprovementAvailable =
        recommendations?.some((recommendation) =>
          [
            UserMedicationRecommendationType.improvementAvailable,
            UserMedicationRecommendationType.notStarted,
          ].includes(recommendation.displayInformation.type),
        ) ?? false

      if (hasImprovementAvailable) {
        const message = UserMessage.createMedicationUptitration()
        const didAddMessage = await messageService.addMessage(userId, message)
        if (didAddMessage) {
          const user = await this.factory.user().getUser(userId)
          await messageService.sendNotification(userId, message, {
            language: user?.content.language,
          })
        }
      }
    } catch (error) {
      console.error(
        `Error updating symptom scores for questionnaire response ${questionnaireResponseId} for user ${userId}: ${String(error)}`,
      )
    }
  }

  async userEnrolled(userId: string) {
    try {
      await this.updateRecommendationsForUser(userId)
      const messageService = this.factory.message()
      const welcomeMessage = UserMessage.createWelcome({
        videoReference: VideoReference.welcome,
      })
      await messageService.addMessage(userId, welcomeMessage)
      const user = await this.factory.user().getUser(userId)
      await messageService.sendNotification(userId, welcomeMessage, {
        language: user?.content.language ?? 'en-US',
      })
    } catch (error) {
      console.error(
        `Error updating user data for enrollment for user ${userId}: ${String(error)}`,
      )
    }
  }

  async userAllergyIntoleranceWritten(userId: string): Promise<void> {
    await this.updateRecommendationsForUser(userId)
  }

  async userObservationWritten(
    userId: string,
    collection: UserObservationCollection,
  ): Promise<void> {
    await this.updateRecommendationsForUser(userId)

    switch (collection) {
      case UserObservationCollection.bodyWeight: {
        try {
          const date = new Date()
          const healthSummaryService = this.factory.healthSummary()
          const bodyWeightObservations =
            await healthSummaryService.getBodyWeightObservations(
              userId,
              advanceDateByDays(date, -7),
              QuantityUnit.lbs,
            )

          const bodyWeightMedian = median(
            bodyWeightObservations.map((observation) => observation.value),
          )
          if (!bodyWeightMedian) return
          const mostRecentBodyWeight = bodyWeightObservations[0].value

          if (mostRecentBodyWeight - bodyWeightMedian >= 7)
            await this.factory
              .message()
              .addMessage(userId, UserMessage.createWeightGain())
        } catch (error) {
          console.error(
            `Error on user body weight observation written: ${String(error)}`,
          )
        }
      }
      case UserObservationCollection.bloodPressure:
      case UserObservationCollection.bodyWeight:
      case UserObservationCollection.heartRate: {
        const patientService = this.factory.patient()
        const yesterday = advanceDateByDays(new Date(), -1)
        const [bloodPressure, bodyWeight, heartRate] = await Promise.all([
          patientService.getBloodPressureObservations(userId, yesterday),
          patientService.getBodyWeightObservations(userId, yesterday),
          patientService.getHeartRateObservations(userId, yesterday),
        ])

        if (
          bloodPressure.length > 0 &&
          bodyWeight.length > 0 &&
          heartRate.length > 0
        ) {
          await this.factory
            .message()
            .completeMessages(userId, UserMessageType.vitals)
        }
      }
    }
  }

  async userMedicationRequestWritten(userId: string): Promise<void> {
    await this.updateRecommendationsForUser(userId)
  }

  // Methods - Actions

  async updateAllSymptomScores(userId: string) {
    try {
      const patientService = this.factory.patient()
      const symptomScores = await patientService.getSymptomScores(userId)
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

  async updateRecommendationsForUser(
    userId: string,
  ): Promise<UserMedicationRecommendation[] | undefined> {
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

      const recommendationsChanged =
        await patientService.updateMedicationRecommendations(
          userId,
          recommendations,
        )

      return recommendations
    } catch (error) {
      console.error(
        `Error updating medication recommendations for user ${userId}: ${String(error)}`,
      )
      return undefined
    }
  }

  // Helpers

  private async addMedicationUptitrationMessageIfNeeded(input: {
    userId: string
    recommendations?: UserMedicationRecommendation[]
  }): Promise<boolean> {
    const hasImprovementAvailable =
      input.recommendations?.some((recommendation) =>
        [
          UserMedicationRecommendationType.improvementAvailable,
          UserMedicationRecommendationType.notStarted,
        ].includes(recommendation.displayInformation.type),
      ) ?? false

    if (!hasImprovementAvailable) return false
    const message = UserMessage.createMedicationUptitration()
    const messageService = this.factory.message()
    const didAddMessage = await messageService.addMessage(input.userId, message)
    if (!didAddMessage) return false
    const user = await this.factory.user().getUser(input.userId)
    await messageService.sendNotification(input.userId, message, {
      language: user?.content.language,
    })
    return true
  }
}
