//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  FHIRMedicationRequest,
  LoincCode,
  type Observation,
  type FHIRQuestionnaireResponse,
  UserSex,
  QuantityUnit,
  FHIRAppointment,
  FHIRAppointmentStatus,
  UserObservationCollection,
} from '@stanfordbdhg/engagehf-models'
import { logger } from 'firebase-functions/v2'
import { z } from 'zod'
import { type Document } from '../database/databaseService.js'
import { type PatientService } from '../patient/patientService.js'
import {
  MedicationGroup,
  QuestionnaireLinkId,
} from '../seeding/staticData/questionnaireFactory/questionnaireLinkIds.js'

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
    options: { isNew: boolean },
  ): Promise<boolean>

  // Methods - Extract

  protected extractAppointment(
    response: FHIRQuestionnaireResponse,
  ): FHIRAppointment | null {
    const linkIds = QuestionnaireLinkId.appointment

    const exists = response
      .leafResponseItem(linkIds.exists)
      ?.answer?.at(0)?.valueBoolean
    if (exists !== true) return null

    const dateAnswer = response
      .leafResponseItem(linkIds.date)
      ?.answer?.at(0)?.valueDate
    if (dateAnswer === undefined) return null

    return FHIRAppointment.create({
      userId: '',
      created: new Date(),
      status: FHIRAppointmentStatus.booked,
      start: dateAnswer,
      durationInMinutes: 30,
    })
  }

  protected extractPersonalInfo(
    response: FHIRQuestionnaireResponse,
  ): { dateOfBirth: Date; sex: UserSex } | null {
    const linkIds = QuestionnaireLinkId.personalInformation
    try {
      const dateOfBirth = response
        .leafResponseItem(linkIds.dateOfBirth)
        ?.answer?.at(0)?.valueDate
      if (dateOfBirth === undefined) return null

      const sexCode = response.leafResponseItem(linkIds.sex)?.answer?.at(0)
        ?.valueCoding?.code
      const sex = z.nativeEnum(UserSex).parse(sexCode)
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
    const linkIds = QuestionnaireLinkId.labValue(options.code)
    const dateAnswer = response
      .leafResponseItem(linkIds.date)
      ?.answer?.at(0)?.valueDate
    if (dateAnswer === undefined) return null

    const decimalAnswer = response
      .leafResponseItem(linkIds.number)
      ?.answer?.at(0)?.valueDecimal

    if (decimalAnswer === undefined) return null

    return {
      value: decimalAnswer,
      unit: options.unit,
      date: dateAnswer,
    }
  }

  protected extractMedicationRequests(
    response: FHIRQuestionnaireResponse,
  ): FHIRMedicationRequest[] {
    const requests: FHIRMedicationRequest[] = []
    for (const medicationGroup of Object.values(MedicationGroup)) {
      const linkIds = QuestionnaireLinkId.medication(medicationGroup)
      const exists = response
        .leafResponseItem(linkIds.exists)
        ?.answer?.at(0)?.valueBoolean

      if (exists === undefined)
        throw new Error(`Missing medication group: ${medicationGroup}.`)
      if (!exists) continue

      const drugCoding = response
        .leafResponseItem(linkIds.drug)
        ?.answer?.at(0)?.valueCoding
      const quantity = response
        .leafResponseItem(linkIds.quantity)
        ?.answer?.at(0)?.valueDecimal
      const frequency = response
        .leafResponseItem(linkIds.frequency)
        ?.answer?.at(0)?.valueDecimal

      if (
        drugCoding?.code === undefined ||
        quantity === undefined ||
        frequency === undefined
      )
        throw new Error(
          `Missing medication group: ${medicationGroup} - drug, quantity or frequency.`,
        )

      const request = FHIRMedicationRequest.create({
        medicationReference: drugCoding.code,
        medicationReferenceDisplay: drugCoding.display?.replace(/\s+/g, ' '),
        frequencyPerDay: frequency,
        quantity: quantity,
      })
      requests.push(request)
    }
    return requests
  }

  // Methods - Handle

  protected async handleLabValues(input: {
    userId: string
    patientService: PatientService
    dateOfBirth: Date | null
    sex: UserSex | null
    response: Document<FHIRQuestionnaireResponse>
  }): Promise<void> {
    const observationValues: Array<{
      observation: Observation
      loincCode: LoincCode
      collection: UserObservationCollection
    }> = []

    const creatinine = this.extractLabValue(input.response.content, {
      code: LoincCode.creatinine,
      unit: QuantityUnit.mg_dL,
    })
    if (creatinine !== null) {
      observationValues.push({
        observation: creatinine,
        loincCode: LoincCode.creatinine,
        collection: UserObservationCollection.creatinine,
      })

      if (input.dateOfBirth !== null && input.sex !== null) {
        const eGfr = this.calculateEstimatedGlomerularFiltrationRate({
          creatinine: creatinine.value,
          dateOfBirth: input.dateOfBirth,
          sex: input.sex,
          date: creatinine.date,
        })
        if (eGfr !== null) {
          observationValues.push({
            observation: eGfr,
            loincCode: LoincCode.estimatedGlomerularFiltrationRate,
            collection: UserObservationCollection.eGfr,
          })
        } else {
          logger.error(
            `Unable to calculate eGFR for user ${input.userId} with creatinine ${creatinine.value}, date of birth ${input.dateOfBirth.toString()} and sex ${input.sex}.`,
          )
        }
      } else {
        logger.error(
          `Missing date of birth or user sex for eGFR calculation for user ${input.userId}.`,
        )
      }
    }

    const dryWeight = this.extractLabValue(input.response.content, {
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

    const potassium = this.extractLabValue(input.response.content, {
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
      await input.patientService.createObservations(
        input.userId,
        observationValues,
        {
          type: input.response.content.resourceType,
          reference: input.response.path,
        },
      )
    }
  }

  // Methods - Helpers

  private calculateEstimatedGlomerularFiltrationRate(input: {
    creatinine: number
    dateOfBirth: Date
    sex: UserSex
    date: Date
  }): Observation | null {
    //
    // https://www.kidney.org/ckd-epi-creatinine-equation-2021
    //
    // eGFR = 142 x min(S_cr/κ, 1)^alpha x max(S_cr/κ, 1)-1.200 x 0.9938^age x 1.012 [if female]
    //
    // where:
    // - S_cr = standardized serum creatinine in mg/dL
    // - κ = 0.7 (females) or 0.9 (males)
    // - alpha = -0.241 (female) or -0.302 (male)
    // - min(Scr/κ, 1) is the minimum of Scr/κ or 1.0
    // - max(Scr/κ, 1) is the maximum of Scr/κ or 1.0
    // - age (years)
    //
    // Additional source for testing:
    // - https://www.mdcalc.com/calc/3939/ckd-epi-equations-glomerular-filtration-rate-gfr
    //

    const age = this.calculateAge(input.dateOfBirth, input.date)
    let value: number | null
    switch (input.sex) {
      case UserSex.female: {
        const k = 0.7
        const min = Math.min(input.creatinine / k, 1)
        const max = Math.max(input.creatinine / k, 1)
        value =
          142 *
          Math.pow(min, -0.241) *
          Math.pow(max, -1.2) *
          Math.pow(0.9938, age) *
          1.012
        break
      }
      case UserSex.male: {
        const k = 0.9
        const min = Math.min(input.creatinine / k, 1)
        const max = Math.max(input.creatinine / k, 1)
        value =
          142 *
          Math.pow(min, -0.302) *
          Math.pow(max, -1.2) *
          Math.pow(0.9938, age)
        break
      }
      case UserSex.other:
        // TODO: Possibly figure out how to handle non-binary users
        value = null
    }

    return value !== null ?
        {
          value: value,
          unit: QuantityUnit.mL_min_173m2,
          date: input.date,
        }
      : null
  }

  private calculateAge(dateOfBirth: Date, present: Date = new Date()): number {
    const yearDiff = present.getFullYear() - dateOfBirth.getFullYear()
    const monthDiff = present.getMonth() - dateOfBirth.getMonth()
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && present.getDate() <= dateOfBirth.getDate())
    ) {
      return yearDiff - 1
    }
    return yearDiff
  }
}
