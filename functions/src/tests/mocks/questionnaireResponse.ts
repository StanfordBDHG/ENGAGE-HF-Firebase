//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type FHIRQuestionnaireResponse } from '../../models/fhir/questionnaireResponse.js'

export function mockQuestionnaireResponse(): FHIRQuestionnaireResponse {
  return {
    authored: new Date('2024-07-18T18:46:37.219581961-07:00'),
    id: '60193B69-B0F7-4708-8CCE-F3CB2936628D',
    item: [
      {
        answer: [
          {
            valueCoding: {
              code: '1',
              display: 'Extremely Limited',
              system: 'urn:uuid:8290e1d8-8141-4982-deb9-57f9d2e13a14',
            },
          },
        ],
        linkId: 'a459b804-35bf-4792-f1eb-0b52c4e176e1',
      },
      {
        answer: [
          {
            valueCoding: {
              code: '4',
              display: 'Slightly Limited',
              system: 'urn:uuid:8290e1d8-8141-4982-deb9-57f9d2e13a14',
            },
          },
        ],
        linkId: 'cf9c5031-1ed5-438a-fc7d-dc69234015a0',
      },
      {
        answer: [
          {
            valueCoding: {
              code: '3',
              display: 'Moderately Limited',
              system: 'urn:uuid:8290e1d8-8141-4982-deb9-57f9d2e13a14',
            },
          },
        ],
        linkId: '1fad0f81-b2a9-4c8f-9a78-4b2a5d7aef07',
      },
      {
        answer: [
          {
            valueCoding: {
              code: '2',
              display: '3 or more times per week but not every day',
              system: 'urn:uuid:2b2f9a9a-e721-495a-82d6-fbc1b22a27b2',
            },
          },
        ],
        linkId: '692bda7d-a616-43d1-8dc6-8291f6460ab2',
      },
      {
        answer: [
          {
            valueCoding: {
              code: '3',
              display: 'At least once a day',
              system: 'urn:uuid:2b2f9a9a-e721-495a-82d6-fbc1b22a27b2',
            },
          },
        ],
        linkId: 'b1734b9e-1d16-4238-8556-5ae3fa0ba913',
      },
      {
        answer: [
          {
            valueCoding: {
              code: '4',
              display: '3 or more times per week but not every day',
              system: 'urn:uuid:2b2f9a9a-e721-495a-82d6-fbc1b22a27b2',
            },
          },
        ],
        linkId: '57f37fb3-a0ad-4b1f-844e-3f67d9b76946',
      },
      {
        answer: [
          {
            valueCoding: {
              code: '5',
              display: 'Never over the past 2 weeks',
              system: 'urn:uuid:2b2f9a9a-e721-495a-82d6-fbc1b22a27b2',
            },
          },
        ],
        linkId: '396164df-d045-4c56-d710-513297bdc6f2',
      },
      {
        answer: [
          {
            valueCoding: {
              code: '3',
              display: 'It has moderately limited my enjoyment of life',
              system: 'urn:uuid:2b2f9a9a-e721-495a-82d6-fbc1b22a27b2',
            },
          },
        ],
        linkId: '75e3f62e-e37d-48a2-f4d9-af2db8922da0',
      },
      {
        answer: [
          {
            valueCoding: {
              code: '4',
              display: 'Mostly satisfied',
              system: 'urn:uuid:2b2f9a9a-e721-495a-82d6-fbc1b22a27b2',
            },
          },
        ],
        linkId: 'fce3a16e-c6d8-4bac-8ab5-8f4aee4adc08',
      },
      {
        answer: [
          {
            valueCoding: {
              code: '2',
              display: 'Limited quite a bit',
              system: 'urn:uuid:90ab9a5a-0ed7-43e0-9131-75ab9d8b94cf',
            },
          },
        ],
        linkId: '8b022e69-127d-4447-8190-39ac645e60e1',
      },
      {
        answer: [
          {
            valueCoding: {
              code: '4',
              display: 'Slightly limited',
              system: 'urn:uuid:90ab9a5a-0ed7-43e0-9131-75ab9d8b94cf',
            },
          },
        ],
        linkId: '1eee7259-da1c-4cba-80a9-e67e684573a1',
      },
      {
        answer: [
          {
            valueCoding: {
              code: '4',
              display: 'Slightly limited',
              system: 'urn:uuid:90ab9a5a-0ed7-43e0-9131-75ab9d8b94cf',
            },
          },
        ],
        linkId: '883a22a8-2f6e-4b41-84b7-0028ed543192',
      },
      {
        answer: [
          {
            valueCoding: {
              code: '3',
              display: 'Moderately bothersome',
              system: 'urn:uuid:2b2f9a9a-e721-495a-82d6-fbc1b22a27b2',
            },
          },
        ],
        linkId: '24108967-2ff3-40d0-c54f-a7b97bb84d05',
      },
    ],
    questionnaire:
      'http://spezi.health/fhir/questionnaire/9528ccc2-d1be-4c4c-9c3c-19f78e51ec19',
  }
}
