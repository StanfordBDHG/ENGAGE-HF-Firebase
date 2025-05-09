//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { fhirCodingConverter } from './baseTypes/fhirCoding.js'
import {
  FHIRResource,
  fhirResourceConverter,
  type FHIRResourceInput,
} from './baseTypes/fhirElement.js'
import { dateConverter } from '../helpers/dateConverter.js'
import { Lazy } from '../helpers/lazy.js'
import { optionalish } from '../helpers/optionalish.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'
import { fhirQuantityConverter } from './baseTypes/fhirQuantity.js'

const fhirQuestionnaireResponseItemBaseConverter = new SchemaConverter({
  schema: z.object({
    answer: optionalish(
      z
        .object({
          valueCoding: optionalish(
            z.lazy(() => fhirCodingConverter.value.schema),
          ),
          valueDate: optionalish(dateConverter.schema),
          valueString: optionalish(z.string()),
          valueBoolean: optionalish(z.boolean()),
          valueInteger: optionalish(z.number().int()),
          valueDecimal: optionalish(z.number()),
          valueQuantity: optionalish(
            z.lazy(() => fhirQuantityConverter.value.schema),
          ),
        })
        .array(),
    ),
    linkId: optionalish(z.string()),
  }),
  encode: (object) => ({
    answer:
      object.answer?.flatMap((value) => ({
        valueCoding:
          value.valueCoding ?
            fhirCodingConverter.value.encode(value.valueCoding)
          : null,
        valueDate:
          value.valueDate ? dateConverter.encode(value.valueDate) : null,
        valueString: value.valueString ?? null,
        valueBoolean: value.valueBoolean ?? null,
        valueInteger: value.valueInteger ?? null,
        valueDecimal: value.valueDecimal ?? null,
        valueQuantity:
          value.valueQuantity ?
            fhirQuantityConverter.value.encode(value.valueQuantity)
          : null,
      })) ?? null,
    linkId: object.linkId ?? null,
  }),
})

export interface FHIRQuestionnaireResponseItemValue
  extends z.input<
    typeof fhirQuestionnaireResponseItemBaseConverter.value.schema
  > {
  item?:
    | Array<z.input<typeof fhirQuestionnaireResponseItemConverter.value.schema>>
    | null
    | undefined
}

export const fhirQuestionnaireResponseItemConverter = (() => {
  const fhirQuestionnaireResponseItemSchema: z.ZodType<
    FHIRQuestionnaireResponseItem,
    z.ZodTypeDef,
    FHIRQuestionnaireResponseItemValue
  > = fhirQuestionnaireResponseItemBaseConverter.value.schema.extend({
    item: optionalish(
      z.array(z.lazy(() => fhirQuestionnaireResponseItemSchema)),
    ),
  })

  function fhirQuestionnaireResponseItemEncode(
    object: z.output<typeof fhirQuestionnaireResponseItemSchema>,
  ): z.input<typeof fhirQuestionnaireResponseItemSchema> {
    return {
      ...fhirQuestionnaireResponseItemBaseConverter.value.encode(object),
      item:
        object.item ?
          object.item.map(fhirQuestionnaireResponseItemConverter.value.encode)
        : null,
    }
  }

  return new SchemaConverter({
    schema: fhirQuestionnaireResponseItemSchema,
    encode: fhirQuestionnaireResponseItemEncode,
  })
})()

export interface FHIRQuestionnaireResponseItem
  extends z.output<
    typeof fhirQuestionnaireResponseItemBaseConverter.value.schema
  > {
  item?: FHIRQuestionnaireResponseItem[]
}

export const fhirQuestionnaireResponseConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: fhirResourceConverter.value.schema
        .extend({
          authored: dateConverter.schema,
          item: optionalish(
            z
              .lazy(() => fhirQuestionnaireResponseItemConverter.value.schema)
              .array(),
          ),
          questionnaire: z.string(),
        })
        .transform((values) => new FHIRQuestionnaireResponse(values)),
      encode: (object) => ({
        ...fhirResourceConverter.value.encode(object),
        authored: dateConverter.encode(object.authored),
        item:
          object.item?.map(
            fhirQuestionnaireResponseItemConverter.value.encode,
          ) ?? null,
        questionnaire: object.questionnaire,
      }),
    }),
)

export class FHIRQuestionnaireResponse extends FHIRResource {
  // Stored Properties

  readonly resourceType: string = 'QuestionnaireResponse'
  readonly authored: Date
  readonly item?: FHIRQuestionnaireResponseItem[]
  readonly questionnaire: string

  // Constructor

  constructor(
    input: FHIRResourceInput & {
      authored: Date
      item?: FHIRQuestionnaireResponseItem[]
      questionnaire: string
    },
  ) {
    super(input)
    this.authored = input.authored
    this.item = input.item
    this.questionnaire = input.questionnaire
  }

  // Methods - Response items from path

  responseItem(linkIdPath: string[]): FHIRQuestionnaireResponseItem | null {
    const items = this.responseItems(linkIdPath)
    switch (items.length) {
      case 0:
        return null
      case 1:
        return items[0]
      default:
        throw new Error(`Unexpected number of response items found.`)
    }
  }

  responseItems(linkIdPath: string[]): FHIRQuestionnaireResponseItem[] {
    const resultValue: FHIRQuestionnaireResponseItem[] = []
    for (const child of this.item ?? []) {
      resultValue.push(...this.responseItemsRecursive(linkIdPath, child))
    }
    return resultValue
  }

  private responseItemsRecursive(
    linkIdPath: string[],
    item: FHIRQuestionnaireResponseItem,
  ): FHIRQuestionnaireResponseItem[] {
    switch (linkIdPath.length) {
      case 0:
        break
      case 1:
        if (item.linkId === linkIdPath[0]) {
          return [item]
        }
        break
      default:
        if (item.linkId === linkIdPath[0]) {
          const childLinkIds = linkIdPath.slice(1)
          const resultValue: FHIRQuestionnaireResponseItem[] = []
          for (const child of item.item ?? []) {
            resultValue.push(
              ...this.responseItemsRecursive(childLinkIds, child),
            )
          }
          return resultValue
        }
        break
    }
    return []
  }

  // Methods - Response items from leaf link id

  leafResponseItem(linkId: string): FHIRQuestionnaireResponseItem | null {
    const items = this.leafResponseItems(linkId)
    switch (items.length) {
      case 0:
        return null
      case 1:
        return items[0]
      default:
        throw new Error('Unexpected number of leaf response items found.')
    }
  }

  leafResponseItems(linkId: string): FHIRQuestionnaireResponseItem[] {
    const items: FHIRQuestionnaireResponseItem[] = []
    for (const item of this.item ?? []) {
      items.push(...this.leafResponseItemsRecursive(linkId, item))
    }
    return items
  }

  private leafResponseItemsRecursive(
    linkId: string,
    item: FHIRQuestionnaireResponseItem,
  ): FHIRQuestionnaireResponseItem[] {
    const items: FHIRQuestionnaireResponseItem[] = []
    for (const child of item.item ?? []) {
      if (child.item !== undefined) {
        items.push(...this.leafResponseItemsRecursive(linkId, child))
      } else if (child.linkId === linkId) {
        items.push(item)
      }
    }
    return items
  }
}
