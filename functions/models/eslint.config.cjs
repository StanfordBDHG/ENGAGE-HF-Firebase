//
// This source file is part of the ENGAGE-HF Firebase open-source project
//
// SPDX-FileCopyrightText: 2025 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

const {
  getEslintNodeConfig,
} = require('@stanfordspezi/spezi-web-configurations')

module.exports = [
  ...getEslintNodeConfig({ tsconfigRootDir: __dirname }),
  {
    rules: {
      'import/no-cycle': 'off',
    },
  },
]
