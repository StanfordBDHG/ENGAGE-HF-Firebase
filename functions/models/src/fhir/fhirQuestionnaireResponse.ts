//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4b.js'
import { FHIRResource } from './fhirResource.js'
import { FHIRSchemaConverter } from '../helpers/fhirSchemaConverter.js'
import { questionnaireResponseSchema } from 'spezi-firebase-fhir'

export class FHIRQuestionnaireResponse extends FHIRResource<QuestionnaireResponse> {
  // Methods - Response items from path

  responseItem(linkIdPath: string[]): QuestionnaireResponseItem | null {
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

  responseItems(linkIdPath: string[]): QuestionnaireResponseItem[] {
    const resultValue: QuestionnaireResponseItem[] = []
    for (const child of this.data.item ?? []) {
      resultValue.push(...this.responseItemsRecursive(linkIdPath, child))
    }
    return resultValue
  }

  private responseItemsRecursive(
    linkIdPath: string[],
    item: QuestionnaireResponseItem,
  ): QuestionnaireResponseItem[] {
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
          const resultValue: QuestionnaireResponseItem[] = []
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

  leafResponseItem(linkId: string): QuestionnaireResponseItem | null {
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

  leafResponseItems(linkId: string): QuestionnaireResponseItem[] {
    const items: QuestionnaireResponseItem[] = []
    for (const item of this.data.item ?? []) {
      items.push(...this.leafResponseItemsRecursive(linkId, item))
    }
    return items
  }

  private leafResponseItemsRecursive(
    linkId: string,
    item: QuestionnaireResponseItem,
  ): QuestionnaireResponseItem[] {
    const children = item.item ?? []
    if (children.length === 0 && item.linkId === linkId) {
      return [item]
    }
    const items: QuestionnaireResponseItem[] = []
    for (const child of item.item ?? []) {
      items.push(...this.leafResponseItemsRecursive(linkId, child))
    }
    return items
  }
}

/*
export const fhirQuestionnaireResponseConverter =
  new FHIRSchemaConverter<FHIRQuestionnaireResponse>({
    schema: questionnaireResponseSchema.transform(
      (data) => new FHIRQuestionnaireResponse(data),
    ),
    nullProperties: ['authored'],
  })
*/