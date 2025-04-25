//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type FHIRMedication,
  type FHIRQuestionnaire,
} from '@stanfordbdhg/engagehf-models'
import { QuestionnaireFactory } from './questionnaireFactory.js'

interface RegistrationQuestionnaireFactoryInput {
  medications: Record<string, FHIRMedication>
  drugs: Record<string, Record<string, FHIRMedication>>
}

const linkIds = {
  introductionPage: 'introduction-page',

  personalInformationPage: 'personal-information-page',
  dateOfBirth: 'date-of-birth',
  sex: 'sex',

  creatinineExists: 'creatinine',
  creatinineValue: 'creatinine-value',
  creatinineDate: 'creatinine-date',

  dryWeightExists: 'dry-weight',
  dryWeightValue: 'dry-weight-value',
  dryWeightDate: 'dry-weight-date',

  egfrExists: 'egfr',
  egfrValue: 'egfr-value',
  egfrDate: 'egfr-date',

  potassiumExists: 'potassium',
  potassiumValue: 'potassium-value',
  potassiumDate: 'potassium-date',

  betablockersExists: 'betablockers',
  betablockersQuantity: 'betablockers-quantity',
  betablockersFrequency: 'betablockers-frequency',
  betablockersDrug: 'betablockers-drug',

  rasiExists: 'rasi',
  rasiQuantity: 'rasi-quantity',
  rasiFrequency: 'rasi-frequency',
  rasiDrug: 'rasi-drug',

  mraExists: 'mra',
  mraQuantity: 'mra-quantity',
  mraFrequency: 'mra-frequency',
  mraDrug: 'mra-drug',

  sglt2iExists: 'sglt2i',
  sglt2iQuantity: 'sglt2i-quantity',
  sglt2iFrequency: 'sglt2i-frequency',
  sglt2iDrug: 'sglt2i-drug',

  diureticsExists: 'diuretics',
  diureticsQuantity: 'diuretics-quantity',
  diureticsFrequency: 'diuretics-frequency',
  diureticsDrug: 'diuretics-drug',
} as const

export class RegistrationQuestionnaireFactory extends QuestionnaireFactory<RegistrationQuestionnaireFactoryInput> {
  create(input: RegistrationQuestionnaireFactoryInput): FHIRQuestionnaire {
    return this.questionnaire({
      id: 'registration_en_US',
      title: 'Registration Survey',
      item: [
        this.displayItem({
          text: 'Welcome to the ENGAGE-HF study! Please complete the following survey to help us understand your health and well-being.',
        }),
        this.pageItem({
          linkId: 'personal-information-page',
          text: 'Personal information',
          item: [
            this.displayItem({
              linkId: 'personal-information-description',
              text: 'Please provide the following information to help us understand your health and well-being.',
            }),
            this.dateItem({
              linkId: 'date-of-birth',
              text: 'Date of Birth',
            }),
            this.radioButtonItem({
              linkId: 'sex',
              text: 'Select your sex:',
              answerOption: this.valueSetAnswerOptions({
                system: 'engage-hf-sex',
                values: [
                  { code: 'male', display: 'Male' },
                  { code: 'female', display: 'Female' },
                  { code: 'other', display: 'Other' },
                ],
              }),
            }),
          ],
        }),
        ...this.labInputPages(),
        ...this.medicationInputPages({
          medications: input.medications,
          drugs: input.drugs,
        }),
      ],
    })
  }
}
