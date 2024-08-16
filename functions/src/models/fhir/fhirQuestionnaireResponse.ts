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
import { Lazy } from '../../services/factory/lazy.js'
import { symptomQuestionnaireLinkIds } from '../../services/fhir/symptomQuestionnaireLinkIds.js'
import { dateConverter } from '../helpers/dateConverter.js'
import { optionalish } from '../helpers/optionalish.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'
import { type SymptomQuestionnaireResponse } from '../symptomQuestionnaireResponse.js'

export const fhirQuestionnaireResponseItemConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: z.object({
        answer: optionalish(
          z
            .object({
              valueCoding: optionalish(
                z.lazy(() => fhirCodingConverter.value.schema),
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
          })) ?? null,
        linkId: object.linkId ?? null,
      }),
    }),
)

export type FHIRQuestionnaireResponseItem = z.output<
  typeof fhirQuestionnaireResponseItemConverter.value.schema
>

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
  // Static Functions

  static create(
    input: SymptomQuestionnaireResponse,
  ): FHIRQuestionnaireResponse {
    const linkIds = symptomQuestionnaireLinkIds(input.questionnaire)

    return new FHIRQuestionnaireResponse({
      resourceType: 'QuestionnaireResponse',
      id: input.questionnaireResponse,
      questionnaire: input.questionnaire,
      authored: input.date,
      item: [
        {
          linkId: linkIds.question1a,
          answer: [
            {
              valueCoding: {
                code: input.answer1a.toString(),
              },
            },
          ],
        },
        {
          linkId: linkIds.question1b,
          answer: [
            {
              valueCoding: {
                code: input.answer1b.toString(),
              },
            },
          ],
        },
        {
          linkId: linkIds.question1c,
          answer: [
            {
              valueCoding: {
                code: input.answer1c.toString(),
              },
            },
          ],
        },
        {
          linkId: linkIds.question2,
          answer: [
            {
              valueCoding: {
                code: input.answer2.toString(),
              },
            },
          ],
        },
        {
          linkId: linkIds.question3,
          answer: [
            {
              valueCoding: {
                code: input.answer3.toString(),
              },
            },
          ],
        },
        {
          linkId: linkIds.question4,
          answer: [
            {
              valueCoding: {
                code: input.answer4.toString(),
              },
            },
          ],
        },
        {
          linkId: linkIds.question5,
          answer: [
            {
              valueCoding: {
                code: input.answer5.toString(),
              },
            },
          ],
        },
        {
          linkId: linkIds.question6,
          answer: [
            {
              valueCoding: {
                code: input.answer6.toString(),
              },
            },
          ],
        },
        {
          linkId: linkIds.question7,
          answer: [
            {
              valueCoding: {
                code: input.answer7.toString(),
              },
            },
          ],
        },
        {
          linkId: linkIds.question8a,
          answer: [
            {
              valueCoding: {
                code: input.answer8a.toString(),
              },
            },
          ],
        },
        {
          linkId: linkIds.question8b,
          answer: [
            {
              valueCoding: {
                code: input.answer8b.toString(),
              },
            },
          ],
        },
        {
          linkId: linkIds.question8c,
          answer: [
            {
              valueCoding: {
                code: input.answer8c.toString(),
              },
            },
          ],
        },
        {
          linkId: linkIds.question9,
          answer: [
            {
              valueCoding: {
                code: input.answer9.toString(),
              },
            },
          ],
        },
      ],
    })
  }

  // Stored Properties

  readonly resourceType: string = 'QuestionnaireResponse'
  readonly authored: Date
  readonly item?: FHIRQuestionnaireResponseItem[]
  readonly questionnaire: string

  // Computed Properties

  get symptomQuestionnaireResponse(): SymptomQuestionnaireResponse {
    const linkIds = symptomQuestionnaireLinkIds(this.questionnaire)
    return {
      questionnaire: this.questionnaire,
      questionnaireResponse: this.id ?? undefined,
      date: this.authored,
      answer1a: this.numericSingleAnswerForLink(linkIds.question1a),
      answer1b: this.numericSingleAnswerForLink(linkIds.question1b),
      answer1c: this.numericSingleAnswerForLink(linkIds.question1c),
      answer2: this.numericSingleAnswerForLink(linkIds.question2),
      answer3: this.numericSingleAnswerForLink(linkIds.question3),
      answer4: this.numericSingleAnswerForLink(linkIds.question4),
      answer5: this.numericSingleAnswerForLink(linkIds.question5),
      answer6: this.numericSingleAnswerForLink(linkIds.question6),
      answer7: this.numericSingleAnswerForLink(linkIds.question7),
      answer8a: this.numericSingleAnswerForLink(linkIds.question8a),
      answer8b: this.numericSingleAnswerForLink(linkIds.question8b),
      answer8c: this.numericSingleAnswerForLink(linkIds.question8c),
      answer9: this.numericSingleAnswerForLink(linkIds.question9),
    }
  }

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

  // Methods

  numericSingleAnswerForLink(linkId: string): number {
    const answers =
      this.item?.find((item) => item.linkId === linkId)?.answer ?? []
    if (answers.length !== 1)
      throw new Error(`Zero or multiple answers found for linkId ${linkId}.`)
    const code = answers[0].valueCoding?.code
    if (!code) throw new Error(`No answer code found for linkId ${linkId}.`)
    return parseInt(code)
  }
}
