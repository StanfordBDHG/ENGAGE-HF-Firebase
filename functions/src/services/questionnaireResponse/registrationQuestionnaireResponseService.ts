//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  FHIRQuestionnaireResponse,
  LoincCode,
  Observation,
  QuantityUnit,
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
    const personalInfo = this.extractPersonalInfo(response.content)
    if (personalInfo !== null) {
      await this.userService.updatePersonalInfo(userId, personalInfo)
    } else {
      return false
    }

    const medicationRequestContent = this.extractMedicationRequests(
      response.content,
    )
    await this.patientService.replaceMedicationRequests(
      userId,
      medicationRequestContent.requests,
    )

    const observationValues: {
      observation: Observation
      loincCode: LoincCode
      collection: UserObservationCollection
    }[] = []

    const creatinine = this.extractLabValue(response.content, {
      code: LoincCode.creatinine,
      unit: QuantityUnit.mg_dL,
    })
    if (creatinine !== null) {
      observationValues.push({
        observation: creatinine,
        loincCode: LoincCode.creatinine,
        collection: UserObservationCollection.creatinine,
      })
    }

    const dryWeight = this.extractLabValue(response.content, {
      code: LoincCode.dryWeight,
      unit: QuantityUnit.lbs,
    })
    if (dryWeight !== null) {
      observationValues.push({
        observation: dryWeight,
        loincCode: LoincCode.dryWeight,
        collection: UserObservationCollection.dryWeight,
      })
    }

    const estimatedGlomerularFiltrationRate = this.extractLabValue(
      response.content,
      {
        code: LoincCode.estimatedGlomerularFiltrationRate,
        unit: QuantityUnit.mL_min_173m2,
      },
    )
    if (estimatedGlomerularFiltrationRate !== null) {
      observationValues.push({
        observation: estimatedGlomerularFiltrationRate,
        loincCode: LoincCode.estimatedGlomerularFiltrationRate,
        collection: UserObservationCollection.eGfr,
      })
    }

    const potassium = this.extractLabValue(response.content, {
      code: LoincCode.potassium,
      unit: QuantityUnit.mEq_L,
    })
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
