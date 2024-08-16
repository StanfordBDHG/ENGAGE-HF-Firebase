//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import {
  FHIRResource,
  fhirResourceConverter,
  type FHIRResourceInput,
} from './baseTypes/fhirElement.js'
import {
  fhirQuestionnaireItemConverter,
  type FHIRQuestionnaireItem,
} from './baseTypes/fhirQuestionnaireItem.js'
import { Lazy } from '../../services/factory/lazy.js'
import { optionalish } from '../helpers/optionalish.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'

export enum FHIRQuestionnairePublicationStatus {
  draft = 'draft',
  active = 'active',
  retired = 'retired',
  unknown = 'unknown',
}

export const fhirQuestionnaireConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: fhirResourceConverter.value.schema
        .extend({
          status: z.nativeEnum(FHIRQuestionnairePublicationStatus),
          title: optionalish(z.string()),
          language: optionalish(z.string()),
          publisher: optionalish(z.string()),
          url: optionalish(z.string()),
          item: optionalish(
            z.lazy(() => fhirQuestionnaireItemConverter.value.schema).array(),
          ),
        })
        .transform((values) => new FHIRQuestionnaire(values)),
      encode: (object) => ({
        ...fhirResourceConverter.value.encode(object),
        title: object.title ?? null,
        status: object.status,
        language: object.language ?? null,
        publisher: object.publisher ?? null,
        url: object.url ?? null,
        item:
          object.item?.map(fhirQuestionnaireItemConverter.value.encode) ?? null,
      }),
    }),
)

export class FHIRQuestionnaire extends FHIRResource {
  // Properties

  readonly resourceType: string = 'Questionnaire'
  readonly title?: string
  readonly status: FHIRQuestionnairePublicationStatus
  readonly language?: string
  readonly publisher?: string
  readonly url?: string
  readonly item?: FHIRQuestionnaireItem[]

  // Constructor

  constructor(
    input: FHIRResourceInput & {
      title?: string
      status: FHIRQuestionnairePublicationStatus
      language?: string
      publisher?: string
      url?: string
      item?: FHIRQuestionnaireItem[]
    },
  ) {
    super(input)
    this.title = input.title
    this.status = input.status
    this.language = input.language
    this.publisher = input.publisher
    this.url = input.url
    this.item = input.item
  }
}
