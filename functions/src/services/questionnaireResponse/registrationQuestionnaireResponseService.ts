//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  compact,
  FHIRQuestionnaireResponse,
  LoincCode,
  Observation,
  UserObservationCollection,
} from '@stanfordbdhg/engagehf-models'
import { Document } from '../database/databaseService.js'
import { QuestionnaireResponseService } from './questionnaireResponseService.js'
import { PatientService } from '../patient/patientService.js'
import { UserService } from '../user/userService.js'

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
    const dateOfBirth = this.extractDateOfBirth(response.content)
    const sex = this.extractSex(response.content)
    if (dateOfBirth !== null && sex !== null) {
      await this.userService.updatePersonalInfo(userId, {
        dateOfBirth,
        sex,
      })
    } else {
      return false
    }

    this.patientService.updateMedicationRequests
    const observationValues: {
      observation: Observation
      loincCode: LoincCode
      collection: UserObservationCollection
    }[] = []

    const creatinine = this.extractCreatinine(response.content)
    if (creatinine !== null) {
      observationValues.push({
        observation: creatinine,
        loincCode: LoincCode.creatinine,
        collection: UserObservationCollection.creatinine,
      })
    }

    const dryWeight = this.extractDryWeight(response.content)
    if (dryWeight !== null) {
      observationValues.push({
        observation: dryWeight,
        loincCode: LoincCode.bodyWeight,
        collection: UserObservationCollection.dryWeight,
      })
    }

    const estimatedGlomerularFiltrationRate =
      this.extractEstimatedGlomerularFiltrationRate(response.content)
    if (estimatedGlomerularFiltrationRate !== null) {
      observationValues.push({
        observation: estimatedGlomerularFiltrationRate,
        loincCode: LoincCode.estimatedGlomerularFiltrationRate,
        collection: UserObservationCollection.eGfr,
      })
    }

    const potassium = this.extractPotassium(response.content)
    if (potassium !== null) {
      observationValues.push({
        observation: potassium,
        loincCode: LoincCode.potassium,
        collection: UserObservationCollection.potassium,
      })
    }

    if (observationValues.length > 0) {
      await this.patientService.createObservations(userId, observationValues)
    }

    return true
  }
}
