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
  FHIRMedicationRequest,
  LoincCode,
  UserSex,
  MedicationClassReference,
  QuantityUnit,
  dateConverter,
} from '@stanfordbdhg/engagehf-models'
import { type Document } from '../database/databaseService.js'
import { z } from 'zod'

/* eslint-disable @typescript-eslint/no-unused-vars */

export interface QuestionnaireResponseMedicationRequests {
  reference: string
  display: string
  quantity: number
  frequency: number
}

export abstract class QuestionnaireResponseService {
  // Methods - Abstract

  abstract handle(
    userId: string,
    response: Document<FHIRQuestionnaireResponse>,
  ): Promise<boolean>

  // Methods - Protected

  protected extractPersonalInfo(
    response: FHIRQuestionnaireResponse,
  ): { dateOfBirth: Date; sex: UserSex } | null {
    try {
      const dateOfBirth = response
        .leafResponseItem('dateOfBirth')
        ?.answer?.at(0)?.valueDate
      if (dateOfBirth === undefined) return null

      const sex = z
        .nativeEnum(UserSex)
        .parse(
          response.leafResponseItem('sex')?.answer?.at(0)?.valueCoding?.code,
        )
      return {
        dateOfBirth,
        sex,
      }
    } catch {}
    return null
  }

  protected extractLabValue(
    response: FHIRQuestionnaireResponse,
    options: {
      code: LoincCode
      unit: QuantityUnit
    },
  ): Observation | null {
    const dateAnswer = response
      .leafResponseItem(options.code + '.date')
      ?.answer?.at(0)?.valueDate
    if (dateAnswer === undefined) return null

    const quantityAnswer = response
      .leafResponseItem(options.code + '.value')
      ?.answer?.at(0)?.valueQuantity

    const valueInExpectedUnit = options.unit.valueOf(quantityAnswer)
    if (valueInExpectedUnit !== undefined) {
      return {
        value: valueInExpectedUnit,
        unit: options.unit,
        date: dateAnswer,
      }
    }

    const actualValue = quantityAnswer?.value
    const actualUnit = QuantityUnit.allValues.find(
      (unit) => unit.code == quantityAnswer?.unit,
    )
    if (actualValue !== undefined && actualUnit !== undefined) {
      return {
        value: actualValue,
        unit: actualUnit,
        date: dateAnswer,
      }
    }

    return null
  }

  protected extractMedicationRequests(response: FHIRQuestionnaireResponse): {
    requests: FHIRMedicationRequest[]
    ignore: MedicationClassReference[]
  } {
    return {
      requests: [],
      ignore: [],
    }
  }

  // Helpers

  private extractDoubleValue(
    response: FHIRQuestionnaireResponse,
    code: string,
  ): number | null {
    return null
  }
}
