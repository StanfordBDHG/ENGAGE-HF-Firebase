//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  FHIRMedication,
  FHIRQuestionnaire,
  MedicationClassReference,
  QuantityUnit,
} from '@stanfordbdhg/engagehf-models'
import { QuestionnaireFactory } from './QuestionnaireFactory.js'
import { randomUUID } from 'crypto'

interface RegistrationQuestionnaireFactoryInput {
  medications: Record<string, FHIRMedication>
  drugs: Record<string, Record<string, FHIRMedication>>
}

export class RegistrationQuestionnaireFactory extends QuestionnaireFactory<RegistrationQuestionnaireFactoryInput> {
  create(input: RegistrationQuestionnaireFactoryInput): FHIRQuestionnaire {
    return this.questionnaire({
      id: 'e2b0c756-b321-481a-b14a-b839bfd7db4f',
      title: 'Registration Survey',
      item: [
        this.displayItem({
          text: 'Welcome to the ENGAGE-HF study! Please complete the following survey to help us understand your health and well-being.',
        }),
        this.pageItem({
          text: 'Personal information',
          item: [
            this.displayItem({
              text: 'Please provide the following information to help us understand your health and well-being.',
            }),
            this.dateItem({
              linkId: randomUUID(),
              text: 'Date of Birth',
            }),
            this.radioButtonItem({
              linkId: randomUUID(),
              text: 'Select your sex:',
              answerOption: this.valueSetAnswerOptions({
                values: [
                  { code: 'male', display: 'Male' },
                  { code: 'female', display: 'Female' },
                  { code: 'other', display: 'Other' },
                ],
              }),
            }),
          ],
        }),
        ...this.medicationClassPageItems({
          medications: input.medications,
          drugs: input.drugs,
          medicationClasses: [MedicationClassReference.betaBlockers],
          text: 'Beta Blockers',
          linkId: randomUUID(),
        }),
        ...this.medicationClassPageItems({
          medications: input.medications,
          drugs: input.drugs,
          medicationClasses: [
            MedicationClassReference.angiotensinConvertingEnzymeInhibitors,
            MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
          ],
          text: 'RASI',
          linkId: randomUUID(),
        }),
        ...this.medicationClassPageItems({
          medications: input.medications,
          drugs: input.drugs,
          medicationClasses: [
            MedicationClassReference.mineralocorticoidReceptorAntagonists,
          ],
          text: 'MRA',
          linkId: randomUUID(),
        }),
        ...this.medicationClassPageItems({
          medications: input.medications,
          drugs: input.drugs,
          medicationClasses: [MedicationClassReference.sglt2inhibitors],
          text: 'SGLT2i',
          linkId: randomUUID(),
        }),
        ...this.medicationClassPageItems({
          medications: input.medications,
          drugs: input.drugs,
          medicationClasses: [MedicationClassReference.diuretics],
          text: 'Diuretics',
          linkId: randomUUID(),
        }),
        ...this.labInputPages({
          linkId: randomUUID(),
          text: 'Creatinine',
          description:
            'The creatinine level in your body helps understand how your liver handles the drugs you are taking.',
          unit: QuantityUnit.mg_dL,
        }),
        ...this.labInputPages({
          linkId: randomUUID(),
          text: 'Potassium',
          description:
            'The potassium level in your body helps understand how your liver handles the drugs you are taking.',
          unit: QuantityUnit.mEq_L,
        }),
        ...this.labInputPages({
          linkId: randomUUID(),
          text: 'Dry Weight',
          description:
            'The dry weight is useful to set a baseline to check that your weight does not increase unnoticed.',
          unit: QuantityUnit.lbs,
        }),
      ],
    })
  }
}
