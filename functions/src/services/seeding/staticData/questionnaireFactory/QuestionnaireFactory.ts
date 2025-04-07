//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  CodingSystem,
  compactMap,
  FHIRCoding,
  FHIRExtension,
  FHIRExtensionUrl,
  FHIRMedication,
  FHIRQuantity,
  FHIRQuestionnaire,
  FHIRQuestionnaireItem,
  FHIRQuestionnaireItemAnswerOption,
  FHIRQuestionnaireItemType,
  FHIRQuestionnairePublicationStatus,
  FHIRReference,
  MedicationClassReference,
} from '@stanfordbdhg/engagehf-models'
import { FHIRUsageContext } from '@stanfordbdhg/engagehf-models/lib/fhir/baseTypes/fhirUsageContext'
import { randomUUID } from 'crypto'

export enum FHIRQuestionnaireEnableWhenOperator {
  exists = 'exists',
  equals = '=',
  notEquals = '!=',
  greaterThan = '>',
  lessThan = '<',
  greaterThanOrEqual = '>=',
  lessThanOrEqual = '<=',
}

export enum FHIRQuestionnaireEnableBehavior {
  all = 'all',
  any = 'any',
}

export interface FHIRQuestionnaireEnableWhen {
  question: string
  operator: FHIRQuestionnaireEnableWhenOperator
  answerBoolean?: boolean
  answerDecimal?: number
  answerInteger?: number
  answerDate?: string
  answerDateTime?: string
  answerTime?: string
  answerString?: string
  answerCoding?: FHIRCoding
  answerQuantity?: FHIRQuantity
  answerReference?: FHIRReference
}

export abstract class QuestionnaireFactory<Input> {
  // Abstract functions

  abstract create(input: Input): FHIRQuestionnaire

  // Helper functions - ENGAGE-HF specific

  protected medicationChangePage(input: {
    linkId: string
  }): FHIRQuestionnaireItem {
    return this.booleanItem({
      linkId: input.linkId,
      text: 'Have you recently changed your meds?',
    })
  }

  protected medicationInputPage(input: {
    linkId: string
    medications: Record<string, FHIRMedication>
    text: string
  }): FHIRQuestionnaireItem {
    return this.pageItem({
      linkId: input.linkId,
      text: input.text,
      item: [
        this.radioButtonItem({
          linkId: input.linkId + '-medication',
          text: 'Which medication are you currently taking?',
          answerOption: this.valueSetAnswerOptions({
            system: CodingSystem.rxNorm,
            values: Object.entries(input.medications).map(
              ([key, medication]) => ({
                id: key,
                code: medication.rxNormCode ?? key,
                display: medication.displayName ?? key,
              }),
            ),
          }),
        }),
        this.decimalItem({
          linkId: input.linkId + '-frequency',
          text: 'How many intakes per day?',
        }),
        this.decimalItem({
          linkId: input.linkId + '-quantity',
          text: 'How many units per day?',
        }),
      ],
    })
  }

  protected medicationClassPageItem(input: {
    linkId: string
    text: string
    medications: Record<string, FHIRMedication>
    drugs: Record<string, Record<string, FHIRMedication>>
    medicationClasses: MedicationClassReference[]
  }): FHIRQuestionnaireItem {
    const medicationClasses = input.medicationClasses.map((medicationClass) =>
      medicationClass.toString(),
    )
    const ingredientIds = compactMap(
      Object.entries(input.medications),
      ([id, medication]) =>
        (
          medicationClasses.includes(
            medication.medicationClassReference?.reference ?? '',
          )
        ) ?
          id
        : undefined,
    )
    const answers: {
      id: string
      ingredient: FHIRMedication
      drug: FHIRMedication
      text: string
    }[] = []
    for (const ingredientId of ingredientIds) {
      const ingredient = input.medications[ingredientId]
      if (ingredient === undefined) continue
      for (const [drugId, drug] of Object.entries(
        input.drugs[ingredientId] ?? {},
      )) {
        let text = ingredient.displayName ?? ''
        if (ingredient.brandNames.length > 0)
          text += ` (${ingredient.brandNames.join(', ')})`

        text += `\n${drug.ingredient?.map((i) => i.strength?.numerator?.value ?? 0).join('/') ?? ''} mg ${drug.form?.text ?? ''}`
        answers.push({
          id: drugId,
          ingredient: ingredient,
          drug: drug,
          text: text,
        })
      }
    }
    const answerOptions = answers
      .sort((a, b) => a.text.localeCompare(b.text))
      .map((answer) => ({
        valueCoding: {
          id: answer.id,
          code: answer.id,
          system: CodingSystem.rxNorm,
          display: answer.text,
        },
      }))
    return {
      linkId: input.linkId,
      type: FHIRQuestionnaireItemType.group,
      item: [
        {
          linkId: input.linkId + '-drug',
          type: FHIRQuestionnaireItemType.choice,
          text: 'Select the medication you are taking',
          answerOption: answerOptions,
          required: true,
        },
        {
          linkId: input.linkId + '-quantity',
          type: FHIRQuestionnaireItemType.decimal,
          text: 'Quantity per intake',
          required: true,
        },
        {
          linkId: input.linkId + '-frequency',
          type: FHIRQuestionnaireItemType.decimal,
          text: 'Number of intakes per day',
          required: true,
        },
      ],
      text: input.text,
    }
  }

  // Helper functions - Generic

  protected booleanItem(input: {
    linkId: string
    text: string
    required?: boolean
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId,
      text: input.text,
      type: FHIRQuestionnaireItemType.boolean,
      required: input.required ?? true,
    }
  }

  protected dateItem(input: {
    linkId: string
    text: string
    required?: boolean
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId,
      text: input.text,
      type: FHIRQuestionnaireItemType.date,
      required: input.required ?? true,
    }
  }

  protected decimalItem(input: {
    linkId: string
    text: string
    required?: boolean
    unit?: string
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId,
      text: input.text,
      type: FHIRQuestionnaireItemType.decimal,
      unit: input.unit,
      required: input.required ?? true,
    }
  }

  protected displayItem(input: {
    linkId?: string
    text: string
    required?: boolean
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId ?? randomUUID(),
      type: FHIRQuestionnaireItemType.display,
      text: input.text,
      required: input.required ?? false,
    }
  }

  protected pageItem(input: {
    linkId?: string
    text: string
    item: FHIRQuestionnaireItem[]
    extension?: FHIRExtension[]
    required?: boolean
  }): FHIRQuestionnaireItem {
    return {
      linkId: input.linkId ?? randomUUID(),
      type: FHIRQuestionnaireItemType.group,
      extension: [
        ...(input.extension ?? []),
        {
          url: FHIRExtensionUrl.questionnaireItemControl,
          valueCodeableConcept: {
            coding: [
              {
                system: CodingSystem.questionnaireItemControl,
                code: 'page',
                display: 'Page',
              },
            ],
            text: 'Page',
          },
        },
      ],
      item: input.item,
      required: input.required ?? false,
      text: input.text,
    }
  }

  protected questionnaire(input: {
    id: string
    title: string
    status?: FHIRQuestionnairePublicationStatus
    item: FHIRQuestionnaireItem[]
    useContext?: FHIRUsageContext[]
  }): FHIRQuestionnaire {
    return new FHIRQuestionnaire({
      id: input.id,
      title: input.title,
      language: 'en-US',
      status: input.status ?? FHIRQuestionnairePublicationStatus.active,
      publisher: 'Stanford Biodesign Digital Health',
      meta: {
        profile: [
          'http://spezi.health/fhir/StructureDefinition/sdf-Questionnaire',
        ],
        tag: [
          {
            system: 'urn:ietf:bcp:47',
            code: 'en-US',
            display: 'English',
          },
        ],
      },
      useContext: input.useContext ?? [],
      contact: [
        {
          name: 'http://spezi.health',
        },
      ],
      subjectType: ['Patient'],
      url: `http://spezi.health/fhir/questionnaire/${input.id}`,
      item: input.item,
    })
  }

  protected radioButtonItem(input: {
    linkId: string
    text: string
    answerOption: FHIRQuestionnaireItemAnswerOption[]
    required?: boolean
  }): FHIRQuestionnaireItem {
    return {
      extension: [
        {
          url: FHIRExtensionUrl.questionnaireItemControl,
          valueCodeableConcept: {
            coding: [
              {
                system: CodingSystem.questionnaireItemControl,
                code: 'radio-button',
                display: 'Radio Button',
              },
            ],
          },
        },
      ],
      linkId: input.linkId,
      type: FHIRQuestionnaireItemType.choice,
      text: input.text,
      required: input.required ?? true,
      answerOption: input.answerOption,
    }
  }

  protected valueSetAnswerOptions(input: {
    system?: string
    values: {
      id?: string
      code: string
      display: string
    }[]
  }): FHIRQuestionnaireItemAnswerOption[] {
    const system = input.system ?? `urn:uuid:${randomUUID()}`
    return input.values.map((option) => ({
      valueCoding: {
        id: option.id ?? randomUUID(),
        code: option.code,
        system: system,
        display: option.display,
      },
    }))
  }
}
