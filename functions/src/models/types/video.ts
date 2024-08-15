//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { localizedTextConverter, type LocalizedText } from './localizedText.js'
import { Lazy } from '../../services/factory/lazy.js'
import { SchemaConverter } from '../helpers/schemaConverter.js'

export const videoConverter = new Lazy(
  () =>
    new SchemaConverter({
      schema: z
        .object({
          title: localizedTextConverter.schema,
          youtubeId: z.string(),
          orderIndex: z.number(),
        })
        .transform((content) => new Video(content)),
      encode: (object) => ({
        title: localizedTextConverter.encode(object.title),
        youtubeId: object.youtubeId,
        orderIndex: object.orderIndex,
      }),
    }),
)

export class Video {
  // Properties

  readonly title: LocalizedText
  readonly youtubeId: string
  readonly orderIndex: number

  // Constructor

  constructor(input: {
    title: LocalizedText
    youtubeId: string
    orderIndex: number
  }) {
    this.title = input.title
    this.youtubeId = input.youtubeId
    this.orderIndex = input.orderIndex
  }
}
