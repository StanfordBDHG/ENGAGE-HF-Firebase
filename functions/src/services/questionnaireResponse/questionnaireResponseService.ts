//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type Observation,
  type FHIRQuestionnaireResponse,
} from '@stanfordbdhg/engagehf-models'
import { type Document } from '../database/databaseService.js'

/* eslint-disable @typescript-eslint/no-unused-vars */

export interface QuestionnaireResponseMedication {
  code: string
  quantity: number
  frequency: number
}

export abstract class QuestionnaireResponseService {
  // Methods

  abstract handle(
    userId: string,
    response: Document<FHIRQuestionnaireResponse>,
  ): Promise<boolean>

  // Helpers - Personal information

  protected extractDateOfBirth(
    response: FHIRQuestionnaireResponse,
  ): Date | null {
    return null
  }

  protected extractSex(response: FHIRQuestionnaireResponse) {
    return null
  }

  // Helpers - Lab values

  protected extractCreatinine(
    response: FHIRQuestionnaireResponse,
  ): Observation | null {
    return null
  }

  protected extractDryWeight(
    response: FHIRQuestionnaireResponse,
  ): Observation | null {
    return null
  }

  protected extractEstimatedGlomerularFiltrationRate(
    response: FHIRQuestionnaireResponse,
  ): Observation | null {
    return null
  }

  protected extractPotassium(
    response: FHIRQuestionnaireResponse,
  ): Observation | null {
    return null
  }

  // Helpers - Medications

  protected extractMedications(
    response: FHIRQuestionnaireResponse,
  ): QuestionnaireResponseMedication[] {
    return []
  }
}
