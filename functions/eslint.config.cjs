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
      'import/extensions': [
        'warn',
        'ignorePackages',
        {
          ts: 'never',
          tsx: 'never',
          js: 'always',
          jsx: 'never',
          mjs: 'never',
        },
      ],
      // Disable prefer-arrow-functions to match original behavior
      'prefer-arrow-functions/prefer-arrow-functions': 'off',
      // Disable new ESLint recommended rules that surface pre-existing issues
      'no-case-declarations': 'off',
      'no-empty': 'off',
      // Disable stylistic rule that surfaces pre-existing patterns
      '@typescript-eslint/prefer-find': 'off',
      // Disable import/no-cycle due to existing circular dependencies
      'import/no-cycle': 'off',
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
