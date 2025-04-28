//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { FHIRQuestionnaireResponse } from '@stanfordbdhg/engagehf-models'
import { Document } from '../database/databaseService.js'
import { QuestionnaireResponseService } from './questionnaireResponseService.js'
import { PatientService } from '../patient/patientService.js'

export class RegistrationQuestionnaireResponseService extends QuestionnaireResponseService {
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
    const dateOfBirth = this.extractDateOfBirth(response.content)
    const sex = this.extractSex(response.content)
    if (dateOfBirth === null || sex === null) return false

    const medications = this.extractMedications(response.content)
    const creatinine = this.extractCreatinine(response.content)
    const dryWeight = this.extractDryWeight(response.content)
    const eGFR = this.extractEstimatedGlomerularFiltrationRate(response.content)
    const potassium = this.extractPotassium(response.content)
    return true
  }
}
