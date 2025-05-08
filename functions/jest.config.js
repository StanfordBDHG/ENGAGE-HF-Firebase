//
// This source file is part of the Stanford Biodesign Digital Health Spezi Firebase Remote Notifications open-source project
//
// SPDX-FileCopyrightText: 2025 Stanford University
//
// SPDX-License-Identifier: MIT
//

export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    transform: {
      '^.+\\.tsx?$': [
        'ts-jest',
        {
          useESM: true,
          isolatedModules: true,
        },
      ],
    },
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    rootDir: '.',
    roots: ['<rootDir>/src/'],
    extensionsToTreatAsEsm: ['.ts'],
    testMatch: ['**/*.test.ts'],

    coverageThreshold: {
      global: {
        branches: 65,
        functions: 75,
        lines: 75,
        statements: 75,
      },
    },
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.ts'],
}