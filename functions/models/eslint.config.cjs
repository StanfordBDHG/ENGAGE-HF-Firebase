//
// This source file is part of the ENGAGE-HF Firebase open-source project
//
// SPDX-FileCopyrightText: 2025 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

const {
  getEslintNodeConfig,
} = require('@schmiedmayerlab/grove-configurations')
const { configs } = require('typescript-eslint')

module.exports = [
  ...getEslintNodeConfig({ tsconfigRootDir: __dirname }),
  {
    rules: {
      // FHIR's recursive schema graph intentionally mirrors the specification.
      'import-x/no-cycle': 'off',
    },
  },
  {
    files: ['src/codes/codes.ts', 'src/codes/identifiers.ts'],
    rules: {
      // These values are canonical FHIR system identifiers, not network requests.
      'sonarjs/no-clear-text-protocols': 'off',
    },
  },
  {
    // Tests are excluded from the TypeScript program that builds the package.
    ...configs.disableTypeChecked,
    files: ['src/**/*.test.ts'],
  },
  {
    files: ['src/**/*.test.ts'],
    rules: {
      // These fixtures exercise canonical FHIR HTTP identifiers.
      'sonarjs/no-clear-text-protocols': 'off',
    },
  },
]
