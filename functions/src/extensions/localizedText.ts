//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type LocalizedText } from '../models/helpers.js'

export function localize(text: LocalizedText, language: string): string {
  if (typeof text === 'string') return text

  const exactMatch = text[language]
  if (exactMatch) return exactMatch

  const languagePrefix = language.split('-').at(0)
  if (languagePrefix && text[languagePrefix]) return text[languagePrefix]

  const defaultLanguage = 'en'
  const defaultText = text[defaultLanguage]
  if (defaultText) return defaultText

  return Object.values(text).at(0) ?? ''
}
