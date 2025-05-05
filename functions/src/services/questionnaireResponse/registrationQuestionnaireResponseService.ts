//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type FHIRQuestionnaireResponse,
  LoincCode,
  type Observation,
  QuantityUnit,
  UserObservationCollection,
} from '@stanfordbdhg/engagehf-models'
import { QuestionnaireResponseService } from './questionnaireResponseService.js'
import { type Document } from '../database/databaseService.js'
import { type PatientService } from '../patient/patientService.js'
import { type UserService } from '../user/userService.js'
import { QuestionnaireId } from '../seeding/staticData/questionnaireFactory/questionnaireLinkIds.js'

export class RegistrationQuestionnaireResponseService extends QuestionnaireResponseService {
  // Properties

  private readonly patientService: PatientService
  private readonly userService: UserService

  // Constructor

  constructor(patientService: PatientService, userService: UserService) {
    super()
    this.patientService = patientService
    this.userService = userService
  }

  // Methods

  async handle(
    userId: string,
    response: Document<FHIRQuestionnaireResponse>,
  ): Promise<boolean> {
    if (response.content.questionnaire !== QuestionnaireId.registration)
      return false
    const personalInfo = this.extractPersonalInfo(response.content)
    if (personalInfo !== null) {
      await this.userService.updatePersonalInfo(userId, personalInfo)
    } else {
      return false
    }

    await this.handleLabValues({
      userId,
      response,
      patientService: this.patientService,
    })

    const medicationRequestContent = this.extractMedicationRequests(
      response.content,
    )
    await this.patientService.replaceMedicationRequests(
      userId,
      medicationRequestContent.requests,
    )

    const appointment = this.extractAppointment(response.content)
    if (appointment !== null) {
      await this.patientService.createAppointment(userId, appointment)
    }

    return true
  }
}
