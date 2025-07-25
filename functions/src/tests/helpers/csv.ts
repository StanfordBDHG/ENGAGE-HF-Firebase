//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import fs from 'fs'

export function readCsv(
  path: string,
  expectedLines: number,
  perform: (line: string[], index: number) => void,
) {
  const fileContent = fs.readFileSync(path, 'utf8')
  const lines = fileContent
    .replace(/"([\s\S]*?)"/g, (str) =>
      str
        .slice(1, -1)
        .split(',')
        .join('###COMMA###')
        .split('\n')
        .join('###NEWLINE###'),
    )
    .split('\n')
  lines.forEach((line, index) => {
    try {
      const values = line
        .split(',')
        .map((x) =>
          x
            .split('###COMMA###')
            .join(',')
            .split('###NEWLINE###')
            .join('\n')
            .trim(),
        )
      perform(values, index)
    } catch (error) {
      console.error(`Error processing line ${index + 1}:`, error)
      throw error
    }
  })
  expect(lines).toHaveLength(expectedLines)
}
