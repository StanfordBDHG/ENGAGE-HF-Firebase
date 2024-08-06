//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { QuantityUnit } from './quantityUnit.js'
import { symptomQuestionnaireLinkIds } from './symptomQuestionnaireLinkIds.js'
import {
  type FHIRCoding,
  type FHIRCodeableConcept,
  type FHIRReference,
  type FHIRExtension,
  type FHIRElement,
} from '../../models/fhir/baseTypes.js'
import { type FHIRMedication } from '../../models/fhir/medication.js'
import { type FHIRObservation } from '../../models/fhir/observation.js'
import { type FHIRQuestionnaireResponse } from '../../models/fhir/questionnaireResponse.js'
import { type MedicationRequestContext } from '../../models/medicationRequestContext.js'
import { type SymptomQuestionnaireResponse } from '../../models/symptomQuestionnaireResponse.js'
import { type Observation } from '../../models/vitals.js'
import { CodingSystem, FHIRExtensionUrl } from '../codes.js'

export class FhirService {
  // CodeableConcept

  codes(
    concept: FHIRCodeableConcept | undefined,
    filter: FHIRCoding,
  ): string[] {
    return (
      concept?.coding?.flatMap((coding) => {
        if (filter.system && coding.system !== filter.system) return []
        if (filter.version && coding.version !== filter.version) return []
        return coding.code ? [coding.code] : []
      }) ?? []
    )
  }

  containsCoding(
    concept: FHIRCodeableConcept | undefined,
    filter: FHIRCoding[],
  ): boolean {
    return filter.some(
      (filterCoding) =>
        concept?.coding?.some((coding) => {
          if (filterCoding.code && coding.code !== filterCoding.code)
            return false
          if (filterCoding.system && coding.system !== filterCoding.system)
            return false
          if (filterCoding.version && coding.version !== filterCoding.version)
            return false
          return true
        }) ?? false,
    )
  }

  // Medications

  displayName(medication: FHIRMedication): string | undefined {
    return medication.code?.coding?.find(
      (coding) => coding.system === CodingSystem.rxNorm,
    )?.display
  }

  medicationClassReference(
    medication: FHIRMedication,
  ): FHIRReference<FHIRMedication> | undefined {
    return this.extensionsWithUrl(
      medication,
      FHIRExtensionUrl.medicationClass,
    ).at(0)?.valueReference
  }

  minimumDailyDose(medication: FHIRMedication): number[] | undefined {
    const request = this.extensionsWithUrl(
      medication,
      FHIRExtensionUrl.minimumDailyDose,
    ).at(0)?.valueMedicationRequest
    if (!request) return undefined
    return this.extensionsWithUrl(request, FHIRExtensionUrl.totalDailyDose)
      .at(0)
      ?.valueQuantities?.flatMap((quantity) => {
        const value = QuantityUnit.mg.valueOf(quantity)
        return value ? [value] : []
      })
  }

  currentDailyDose(contexts: MedicationRequestContext[]): number[] {
    const dailyDoses: number[] = []
    for (const context of contexts) {
      let numberOfTabletsPerDay = 0
      for (const instruction of context.request.dosageInstruction ?? []) {
        const intakesPerDay = instruction.timing?.repeat?.frequency ?? 0
        for (const dose of instruction.doseAndRate ?? []) {
          const numberOfPills = dose.doseQuantity?.value
          if (!numberOfPills)
            throw new Error('Invalid dose quantity encountered.')
          numberOfTabletsPerDay += numberOfPills * intakesPerDay
        }
      }

      const ingredients = context.drug?.ingredient ?? []

      while (dailyDoses.length < ingredients.length) {
        dailyDoses.push(0)
      }

      ingredients.forEach((ingredient, index) => {
        const strength =
          QuantityUnit.mg.valueOf(ingredient.strength?.numerator) ?? 0
        dailyDoses[index] += numberOfTabletsPerDay * strength
      })
    }
    return dailyDoses
  }

  targetDailyDose(medication: FHIRMedication): number[] | undefined {
    const request = this.extensionsWithUrl(
      medication,
      FHIRExtensionUrl.targetDailyDose,
    ).at(0)?.valueMedicationRequest
    if (!request) return undefined
    const result = this.extensionsWithUrl(
      request,
      FHIRExtensionUrl.totalDailyDose,
    )
      .at(0)
      ?.valueQuantities?.flatMap((quantity) => {
        const value = QuantityUnit.mg.valueOf(quantity)
        return value ? [value] : []
      })
    return result
  }

  // Extension

  extensionsWithUrl(
    element: FHIRElement,
    url: FHIRExtensionUrl,
  ): FHIRExtension[] {
    return (
      element.extension?.filter(
        (extension) => extension.url === url.toString(),
      ) ?? []
    )
  }

  // Observations

  observationValues(
    observations: FHIRObservation[],
    options: {
      unit: QuantityUnit
      component?: FHIRCoding
    } & FHIRCoding,
  ): Observation[] {
    const result: Observation[] = []
    for (const observation of observations) {
      if (!this.containsCoding(observation.code, [options])) continue
      const date =
        observation.effectiveDateTime ??
        observation.effectiveInstant ??
        observation.effectivePeriod?.start ??
        observation.effectivePeriod?.end
      if (!date) continue

      if (options.component) {
        for (const component of observation.component ?? []) {
          if (!this.containsCoding(component.code, [options.component]))
            continue
          const value = options.unit.valueOf(component.valueQuantity)
          if (!value) continue
          result.push({ date: new Date(date), value: value, unit: options.unit })
        }
      } else {
        const value = options.unit.valueOf(observation.valueQuantity)
        if (!value) continue
        result.push({ date: new Date(date), value: value, unit: options.unit })
      }
    }
    return result
  }

  // QuestionnaireResponses

  symptomQuestionnaireResponse(
    response: FHIRQuestionnaireResponse,
  ): SymptomQuestionnaireResponse {
    const linkIds = symptomQuestionnaireLinkIds(response.questionnaire)
    return {
      questionnaire: response.questionnaire,
      questionnaireResponse: response.id,
      date: response.authored,
      answer1a: this.numericSingleAnswer(response, linkIds.question1a),
      answer1b: this.numericSingleAnswer(response, linkIds.question1b),
      answer1c: this.numericSingleAnswer(response, linkIds.question1c),
      answer2: this.numericSingleAnswer(response, linkIds.question2),
      answer3: this.numericSingleAnswer(response, linkIds.question3),
      answer4: this.numericSingleAnswer(response, linkIds.question4),
      answer5: this.numericSingleAnswer(response, linkIds.question5),
      answer6: this.numericSingleAnswer(response, linkIds.question6),
      answer7: this.numericSingleAnswer(response, linkIds.question7),
      answer8a: this.numericSingleAnswer(response, linkIds.question8a),
      answer8b: this.numericSingleAnswer(response, linkIds.question8b),
      answer8c: this.numericSingleAnswer(response, linkIds.question8c),
      answer9: this.numericSingleAnswer(response, linkIds.question9),
    }
  }

  numericSingleAnswer(
    response: FHIRQuestionnaireResponse,
    linkId: string,
  ): number {
    const answers =
      response.item?.find((item) => item.linkId === linkId)?.answer ?? []
    if (answers.length !== 1)
      throw new Error(`Zero or multiple answers found for linkId ${linkId}.`)
    const code = answers[0].valueCoding?.code
    if (!code) throw new Error(`No answer code found for linkId ${linkId}.`)
    return parseInt(code)
  }
}
