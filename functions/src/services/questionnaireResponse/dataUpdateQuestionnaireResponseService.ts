//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type FHIRQuestionnaireResponse } from '@stanfordbdhg/engagehf-models'
import { QuestionnaireResponseService } from './questionnaireResponseService.js'
import { type Document } from '../database/databaseService.js'
import { type PatientService } from '../patient/patientService.js'
import { QuestionnaireId } from '../seeding/staticData/questionnaireFactory/questionnaireLinkIds.js'

export class DataUpdateQuestionnaireResponseService extends QuestionnaireResponseService {
  // Properties

  private readonly patientService: PatientService

  // Constructor

  constructor(patientService: PatientService) {
    super()
    this.patientService = patientService
  }

  // Methods

  async handle(
    userId: string,
    response: Document<FHIRQuestionnaireResponse>,
  ): Promise<boolean> {
    if (
      response.content.id !== QuestionnaireId.dataUpdate &&
      response.content.id !== QuestionnaireId.postVisit
    )
      return false

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
