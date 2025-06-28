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
import { type MessageService } from '../message/messageService.js'
import { type PatientService } from '../patient/patientService.js'
import {
  QuestionnaireId,
  QuestionnaireLinkId,
} from '../seeding/staticData/questionnaireFactory/questionnaireLinkIds.js'
import { type UserService } from '../user/userService.js'
import { EgfrCalculator } from './egfr/egfrCalculator.js'

export class RegistrationQuestionnaireResponseService extends QuestionnaireResponseService {
  // Properties

  private readonly egfrCalculator: EgfrCalculator
  private readonly messageService: MessageService
  private readonly patientService: PatientService
  private readonly userService: UserService

  // Constructor

  constructor(input: {
    egfrCalculator: EgfrCalculator
    messageService: MessageService
    patientService: PatientService
    userService: UserService
  }) {
    super()
    this.egfrCalculator = input.egfrCalculator
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
    const urls = [QuestionnaireLinkId.url(QuestionnaireId.registration)]
    if (!urls.includes(response.content.questionnaire)) return false

    const personalInfo = this.extractPersonalInfo(response.content)
    if (personalInfo !== null) {
      await this.userService.updatePersonalInfo(userId, personalInfo)
    }

    await this.handleLabValues({
      userId,
      response,
      dateOfBirth: personalInfo?.dateOfBirth ?? null,
      sex: personalInfo?.sex ?? null,
      egfrCalculator: this.egfrCalculator,
      patientService: this.patientService,
    })

    await this.handleMedicationRequests({
      userId,
      response,
      patientService: this.patientService,
    })

    const appointment = this.extractAppointment(response.content)
    if (appointment !== null) {
      await this.patientService.createAppointment(userId, appointment)
    }

    if (options.isNew) {
      await this.messageService.completeMessages(
        userId,
        UserMessageType.registrationQuestionnaire,
      )
    }

    return true
  }
}
