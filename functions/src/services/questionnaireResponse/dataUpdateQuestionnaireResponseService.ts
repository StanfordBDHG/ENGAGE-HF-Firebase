//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type User,
  UserMessageType,
  type FHIRQuestionnaireResponse,
} from '@stanfordbdhg/engagehf-models'
import { logger } from 'firebase-functions/v2'
import { QuestionnaireResponseService } from './questionnaireResponseService.js'
import { type Document } from '../database/databaseService.js'
import { type MessageService } from '../message/messageService.js'
import { type PatientService } from '../patient/patientService.js'
import {
  QuestionnaireId,
  QuestionnaireLinkId,
} from '../seeding/staticData/questionnaireFactory/questionnaireLinkIds.js'
import { type UserService } from '../user/userService.js'

export class DataUpdateQuestionnaireResponseService extends QuestionnaireResponseService {
  // Properties

  private readonly messageService: MessageService
  private readonly patientService: PatientService
  private readonly userService: UserService

  // Constructor

  constructor(input: {
    messageService: MessageService
    patientService: PatientService
    userService: UserService
  }) {
    super()
    this.messageService = input.messageService
    this.patientService = input.patientService
    this.userService = input.userService
  }

  // Methods

  async handle(
    userId: string,
    response: Document<FHIRQuestionnaireResponse>,
    options: { isNew: boolean },
  ): Promise<boolean> {
    const postAppointmentUrl = QuestionnaireLinkId.url(
      QuestionnaireId.postAppointment,
    )
    const urls = [
      QuestionnaireLinkId.url(QuestionnaireId.dataUpdate),
      postAppointmentUrl,
    ]
    if (!urls.includes(response.content.questionnaire)) return false

    let user: User | null
    try {
      user = (await this.userService.getUser(userId))?.content ?? null
    } catch (error) {
      logger.error(`Failed to fetch user ${userId}:`, error)
      user = null
    }

    await this.handleLabValues({
      userId,
      response,
      dateOfBirth: user?.dateOfBirth ?? null,
      sex: user?.sex ?? null,
      patientService: this.patientService,
    })

    const medicationRequests = this.extractMedicationRequests(response.content)
    await this.patientService.replaceMedicationRequests(
      userId,
      medicationRequests,
    )

    const appointment = this.extractAppointment(response.content)
    if (appointment !== null) {
      await this.patientService.createAppointment(userId, appointment)
    }

    if (
      options.isNew &&
      response.content.questionnaire === postAppointmentUrl
    ) {
      await this.messageService.completeMessages(
        userId,
        UserMessageType.postAppointmentQuestionnaire,
      )
    }
    return true
  }
}
