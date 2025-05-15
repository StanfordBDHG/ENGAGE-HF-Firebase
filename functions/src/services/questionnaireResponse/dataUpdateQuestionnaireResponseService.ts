//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  UserMessageType,
  type FHIRQuestionnaireResponse,
} from '@stanfordbdhg/engagehf-models'
import { QuestionnaireResponseService } from './questionnaireResponseService.js'
import { type Document } from '../database/databaseService.js'
import { type PatientService } from '../patient/patientService.js'
import {
  QuestionnaireId,
  QuestionnaireLinkId,
} from '../seeding/staticData/questionnaireFactory/questionnaireLinkIds.js'
import { MessageService } from '../message/messageService.js'

export class DataUpdateQuestionnaireResponseService extends QuestionnaireResponseService {
  // Properties

  private readonly messageService: MessageService
  private readonly patientService: PatientService

  // Constructor

  constructor(input: {
    messageService: MessageService
    patientService: PatientService
  }) {
    super()
    this.messageService = input.messageService
    this.patientService = input.patientService
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

    await this.handleLabValues({
      userId,
      response,
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
