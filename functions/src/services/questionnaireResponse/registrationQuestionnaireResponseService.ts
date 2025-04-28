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

    await this.patientService.createObservations(
      userId,
      compact([
        mapNullable(
          this.extractCreatinine(response.content),
          (observation) => ({
            observation,
            loincCode: LoincCode.creatinine,
            collection: UserObservationCollection.creatinine,
          }),
        ),
        mapNullable(this.extractDryWeight(response.content), (observation) => ({
          observation,
          loincCode: LoincCode.bodyWeight,
          collection: UserObservationCollection.dryWeight,
        })),
        mapNullable(
          this.extractEstimatedGlomerularFiltrationRate(response.content),
          (observation) => ({
            observation,
            loincCode: LoincCode.estimatedGlomerularFiltrationRate,
            collection: UserObservationCollection.eGfr,
          }),
        ),
        mapNullable(this.extractPotassium(response.content), (observation) => ({
          observation,
          loincCode: LoincCode.potassium,
          collection: UserObservationCollection.potassium,
        })),
      ]),
    )
    return true
  }
}

function mapNullable<T, U>(
  value: T | null,
  map: (value: T) => U,
): U | undefined {
  if (value === null) return undefined
  return map(value)
}
