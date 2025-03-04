//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  LocalizedText,
  LocalizedTextParams,
} from '@stanfordbdhg/engagehf-models'

export class Localizer<
  Localization extends Record<string, Record<string, string>>,
> {
  // Properties

  private readonly languages: string[]
  private readonly values: Localization

  // Constructor

  constructor(values: Localization, languages: string[]) {
    this.languages = languages
    this.values = values
  }

  // Methods

  text<Key extends keyof Localization>(
    id: Key,
    ...params: Localization[Key]['en'] extends string ?
      LocalizedTextParams<Localization[Key]['en']>
    : never
  ): string {
    return LocalizedText.parametrized(this.values[id], ...params).localize(
      ...this.languages,
    )
  }
}
