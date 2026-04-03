//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

const { getEslintNodeConfig } = require('@stanfordspezi/spezi-web-configurations');

module.exports = [
  ...getEslintNodeConfig({ tsconfigRootDir: __dirname }),
  {
    rules: {
      // Disable import/no-cycle due to existing circular dependencies in models
      'import/no-cycle': 'off',
    },
  },
];
