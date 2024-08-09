//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type DocumentData } from 'firebase-admin/firestore'
import {
  advanceDateByDays,
  advanceDateByMinutes,
} from '../../extensions/date.js'
import { type FHIRQuestionnaireResponse } from '../../models/fhir/questionnaireResponse.js'
import { type ServiceFactory } from '../factory/serviceFactory.js'
import { type RecommendationInput } from '../recommendation/recommenders/recommender.js'
import { UserDataFactory } from '../seeding/userData/userDataFactory.js'
import { QuestionnaireReference, VideoReference } from '../references.js'
import { FHIRObservation } from '../../models/fhir/observation.js'
import { median } from '../../extensions/array.js'

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
      const tomorrow = advanceDateByDays(new Date(), 1)
      const patientService = this.factory.patient()
      const messageService = this.factory.message()

      const appointments = await patientService.getEveryAppoinment(
        advanceDateByMinutes(tomorrow, -15),
        advanceDateByMinutes(tomorrow, 15),
      )

      await Promise.all(
        appointments.map(
          async (appointment) =>
            await messageService.addMessage(
              appointment.path.split('/')[1],
              UserDataFactory.preAppointmentMessage(),
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

      const symptomReminderMessage =
        UserDataFactory.symptomQuestionnaireMessage({
          // TODO: Possibly select different questionnaire depending on localization
          questionnaireReference: QuestionnaireReference.enUS,
        })
      const vitalsMessage = UserDataFactory.vitalsMessage()

      await Promise.all(
        users.map(async (user) => {
          try {
            await messageService.addMessage(user.id, vitalsMessage)
            await messageService.sendNotification(user.id, vitalsMessage, {
              language: user.content.language,
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
                { language: user.content.language },
              )
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

  async userEnrolled(userId: string) {
    try {
      await this.updateRecommendationsForUser(userId)
      await this.factory.message().addMessage(
        userId,
        UserDataFactory.welcomeMessage({
          videoReference: VideoReference.welcome,
        }),
      )
    } catch (error) {
      console.error(
        `Error updating user data for enrollment for user ${userId}: ${String(error)}`,
      )
    }
  }

  async userBodyWeightObservationWritten(userId: string): Promise<void> {
    try {
      const date = new Date()
      const healthSummaryService = this.factory.healthSummary()
      const bodyWeightObservations =
        await healthSummaryService.getBodyWeightObservations(
          userId,
          advanceDateByDays(date, -7),
        )

        if (bodyWeightObservations.length < 1) return

      const bodyWeightMedian = median(
        bodyWeightObservations.map((observation) => observation.value),
      )

      const mostRecentBodyWeight = bodyWeightObservations.at(0)?.value


    } catch (error) {
      console.error(
        `Error on user body weight observation written: ${String(error)}`,
      )
    }
  }

  // Methods - Actions

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
