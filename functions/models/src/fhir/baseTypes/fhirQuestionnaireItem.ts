//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { fhirCodingConverter } from './fhirCoding.js'
import { fhirExtensionConverter } from './fhirElement.js'
import { fhirQuantityConverter } from './fhirQuantity.js'
import { fhirReferenceConverter } from './fhirReference.js'
import {
  dateConverter,
  dateTimeConverter,
} from '../../helpers/dateConverter.js'
import { Lazy } from '../../helpers/lazy.js'
import { optionalish } from '../../helpers/optionalish.js'
import { SchemaConverter } from '../../helpers/schemaConverter.js'

export enum FHIRQuestionnaireItemType {
  group = 'group',
  display = 'display',
  boolean = 'boolean',
  choice = 'choice',
  decimal = 'decimal',
  integer = 'integer',
  date = 'date',
  dateTime = 'dateTime',
  time = 'time',
  string = 'string',
  text = 'text',
  url = 'url',
  coding = 'coding',
  quantity = 'quantity',
  reference = 'reference',
}

const fhirQuestionnaireItemAnswerOptionConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: z.object({
        valueCoding: optionalish(
          z.lazy(() => fhirCodingConverter.value.schema),
        ),
      }),
      encode: (object) => ({
        valueCoding:
          object.valueCoding ?
            fhirCodingConverter.value.encode(object.valueCoding)
          : null,
      }),
    }),
)

export type FHIRQuestionnaireItemAnswerOption = z.output<
  typeof fhirQuestionnaireItemAnswerOptionConverter.value.schema
>

export enum FHIRQuestionnaireItemEnableWhenOperator {
  exists = 'exists',
  equals = '=',
  notEquals = '!=',
  greaterThan = '>',
  lessThan = '<',
  greaterThanOrEqual = '>=',
  lessThanOrEqual = '<=',
}

export enum FHIRQuestionnaireItemEnableBehavior {
  all = 'all',
  any = 'any',
}

const fhirQuestionnaireItemEnableWhenConverter = new SchemaConverter({
  schema: z.object({
    question: z.string(),
    operator: z.nativeEnum(FHIRQuestionnaireItemEnableWhenOperator),
    answerBoolean: optionalish(z.boolean()),
    answerDecimal: optionalish(z.number()),
    answerInteger: optionalish(z.number().int()),
    answerDate: optionalish(dateConverter.schema),
    answerDateTime: optionalish(dateTimeConverter.schema),
    answerString: optionalish(z.string()),
    answerCoding: optionalish(fhirCodingConverter.value.schema),
    answerQuantity: optionalish(fhirQuantityConverter.value.schema),
    answerReference: optionalish(fhirReferenceConverter.value.schema),
  }),
  encode: (object) => ({
    question: object.question,
    operator: object.operator,
    answerBoolean: object.answerBoolean ?? null,
    answerDecimal: object.answerDecimal ?? null,
    answerInteger: object.answerInteger ?? null,
    answerDate:
      object.answerDate !== undefined ?
        dateConverter.encode(object.answerDate)
      : null,
    answerDateTime:
      object.answerDateTime !== undefined ?
        dateTimeConverter.encode(object.answerDateTime)
      : null,
    answerString: object.answerString ?? null,
    answerCoding:
      object.answerCoding !== undefined ?
        fhirCodingConverter.value.encode(object.answerCoding)
      : null,
    answerQuantity:
      object.answerQuantity !== undefined ?
        fhirQuantityConverter.value.encode(object.answerQuantity)
      : null,
    answerReference:
      object.answerReference !== undefined ?
        fhirReferenceConverter.value.encode(object.answerReference)
      : null,
  }),
})

export type FHIRQuestionnaireItemEnableWhen = z.output<
  typeof fhirQuestionnaireItemEnableWhenConverter.schema
>

const fhirQuestionnaireItemBaseConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: z.object({
        linkId: optionalish(z.string()),
        type: optionalish(z.nativeEnum(FHIRQuestionnaireItemType)),
        text: optionalish(z.string()),
        required: optionalish(z.boolean()),
        unit: optionalish(z.string()),
        answerOption: optionalish(
          fhirQuestionnaireItemAnswerOptionConverter.value.schema.array(),
        ),
        enableWhen: optionalish(
          fhirQuestionnaireItemEnableWhenConverter.schema.array(),
        ),
        enableBehavior: optionalish(
          z.nativeEnum(FHIRQuestionnaireItemEnableBehavior),
        ),
        extension: z.lazy(() =>
          optionalish(fhirExtensionConverter.schema.array()),
        ),
      }),
      encode: (object) => ({
        linkId: object.linkId ?? null,
        type: object.type ?? null,
        text: object.text ?? null,
        required: object.required ?? null,
        unit: object.unit ?? null,
        answerOption:
          object.answerOption?.map((option) =>
            fhirQuestionnaireItemAnswerOptionConverter.value.encode(option),
          ) ?? null,
        enableWhen:
          object.enableWhen?.map((option) =>
            fhirQuestionnaireItemEnableWhenConverter.encode(option),
          ) ?? null,
        enableBehavior: object.enableBehavior ?? null,
        extension: object.extension?.map(fhirExtensionConverter.encode) ?? null,
      }),
    }),
)

export interface FHIRQuestionnaireItemInput
  extends z.input<typeof fhirQuestionnaireItemBaseConverter.value.schema> {
  item?: FHIRQuestionnaireItemInput[] | null | undefined
}

export interface FHIRQuestionnaireItem
  extends z.output<typeof fhirQuestionnaireItemBaseConverter.value.schema> {
  item?: FHIRQuestionnaireItem[]
}

export const fhirQuestionnaireItemConverter = new Lazy(() => {
  const fhirQuestionnaireItemSchema: z.ZodType<
    FHIRQuestionnaireItem,
    z.ZodTypeDef,
    FHIRQuestionnaireItemInput
  > = fhirQuestionnaireItemBaseConverter.value.schema.extend({
    item: optionalish(z.lazy(() => fhirQuestionnaireItemSchema.array())),
  })

  function fhirQuestionnaireItemEncode(
    object: z.output<typeof fhirQuestionnaireItemSchema>,
  ): z.input<typeof fhirQuestionnaireItemSchema> {
    return {
      ...fhirQuestionnaireItemBaseConverter.value.encode(object),
      item: object.item ? object.item.map(fhirQuestionnaireItemEncode) : null,
    }
  }

  return new SchemaConverter({
    schema: fhirQuestionnaireItemSchema,
    encode: fhirQuestionnaireItemEncode,
  })
})
