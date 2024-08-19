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
import { type FHIRMedicationRequest } from '../../models/fhir/baseTypes/fhirElement.js'
import { type FHIRQuestionnaireResponse } from '../../models/fhir/fhirQuestionnaireResponse.js'
import {
  type UserMedicationRecommendation,
  UserMedicationRecommendationType,
} from '../../models/types/userMedicationRecommendation.js'
import { UserMessage, UserMessageType } from '../../models/types/userMessage.js'
import { UserObservationCollection } from '../database/collections.js'
import { type ServiceFactory } from '../factory/serviceFactory.js'
import { QuantityUnit } from '../fhir/quantityUnit.js'
import { QuestionnaireReference, VideoReference } from '../references.js'

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
              reference: appointment.path,
            }),
            { notify: true },
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
            (message) => message.reference === appointment.path,
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
            await messageService.addMessage(user.id, vitalsMessage, {
              notify: true,
              language: user.content.language ?? null,
            })

            const enrollmentDate = user.content.dateOfEnrollment
            const durationOfOneDayInMilliseconds = 24 * 60 * 60 * 1000
            if (
              enrollmentDate.getTime() % (durationOfOneDayInMilliseconds * 14) <
              durationOfOneDayInMilliseconds
            ) {
              await messageService.addMessage(user.id, symptomReminderMessage, {
                notify: true,
                language: user.content.language ?? null,
              })
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
        afterData ? symptomScoreCalculator.calculate(afterData) : undefined,
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
        await messageService.addMessage(
          userId,
          UserMessage.createMedicationUptitration(),
          { notify: true },
        )
      }
    } catch (error) {
      console.error(
        `Error updating symptom scores for questionnaire response ${questionnaireResponseId} for user ${userId}: ${String(error)}`,
      )
    }
  }

  async userEnrolled(userId: string) {
    await this.updateRecommendationsForUser(userId)
    try {
      await this.factory.message().addMessage(
        userId,
        UserMessage.createWelcome({
          videoReference: VideoReference.welcome,
        }),
        { notify: true },
      )
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

    if (collection === UserObservationCollection.bodyWeight) {
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
            .addMessage(userId, UserMessage.createWeightGain(), {
              notify: true,
            })
      } catch (error) {
        console.error(
          `Error on user body weight observation written: ${String(error)}`,
        )
      }
    }

    const isUserEnteredObservation = [
      UserObservationCollection.bloodPressure,
      UserObservationCollection.bodyWeight,
      UserObservationCollection.heartRate,
    ].includes(collection)

    if (isUserEnteredObservation) {
      try {
        const patientService = this.factory.patient()
        const yesterday = advanceDateByDays(new Date(), -1)
        const [bloodPressure, bodyWeight, heartRate] = await Promise.all([
          patientService.getBloodPressureObservations(userId, yesterday),
          patientService.getBodyWeightObservations(userId, yesterday),
          patientService.getHeartRateObservations(userId, yesterday),
        ])

        console.log(
          `Checked whether to complete vitals message due to ${bloodPressure.length} blood pressure observations, ${bodyWeight.length} body weight observations, and ${heartRate.length} heart rate observations.`,
        )

        if (
          bloodPressure.length > 0 &&
          bodyWeight.length > 0 &&
          heartRate.length > 0
        ) {
          await this.factory
            .message()
            .completeMessages(userId, UserMessageType.vitals)
        }
      } catch (error) {
        console.error(`Failed updating vitals message: ${String(error)}`)
      }
    }
  }

  async userMedicationRequestWritten(
    userId: string,
    medicationRequestId: string,
    before: FHIRMedicationRequest | undefined,
    after: FHIRMedicationRequest | undefined,
  ): Promise<void> {
    await this.updateRecommendationsForUser(userId)

    try {
      // Drug

      const drugReference =
        after?.medicationReference ?? before?.medicationReference
      if (!drugReference) throw new Error('Drug reference not found.')

      // Medication

      const medicationReference = drugReference.reference
        .split('/')
        .slice(0, 2)
        .join('/')
      const medicationService = this.factory.medication()
      const medication = await medicationService.getReference({
        reference: medicationReference,
      })
      if (!medication) throw new Error('Medication not found.')
      const medicationName = medication.content.displayName
      if (!medicationName) throw new Error('Medication name not found.')

      // Medication Class

      const medicationClass =
        medication.content.medicationClassReference ?
          await medicationService.getClassReference(
            medication.content.medicationClassReference,
          )
        : undefined

      await this.factory.message().addMessage(
        userId,
        UserMessage.createMedicationChange({
          medicationName: medicationName,
          reference: medicationReference,
          videoReference: medicationClass?.content.videoPath,
        }),
        { notify: true },
      )
    } catch (error) {
      console.error(
        `Error creating medication change message for user ${userId}: ${String(error)}`,
      )
    }
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
        QuantityUnit.lbs,
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

      const recommendations = await recommendationService.compute({
        requests: requestContexts,
        contraindications: contraindications.map(
          (document) => document.content,
        ),
        vitals: vitals,
        latestSymptomScore: latestSymptomScore?.content,
      })

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
    await messageService.addMessage(input.userId, message, { notify: true })
    return true
  }
}
