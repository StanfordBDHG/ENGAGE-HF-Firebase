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
            this.dateItem({
              linkId: randomUUID(),
              text: 'Date of Birth',
            }),
          ],
        }),
        this.medicationClassPageItem({
          medications: input.medications,
          drugs: input.drugs,
          medicationClasses: [MedicationClassReference.betaBlockers],
          text: 'Beta Blockers',
          linkId: randomUUID(),
        }),
        this.medicationClassPageItem({
          medications: input.medications,
          drugs: input.drugs,
          medicationClasses: [
            MedicationClassReference.angiotensinConvertingEnzymeInhibitors,
            MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
          ],
          text: 'RASI',
          linkId: randomUUID(),
        }),
        this.medicationClassPageItem({
          medications: input.medications,
          drugs: input.drugs,
          medicationClasses: [
            MedicationClassReference.mineralocorticoidReceptorAntagonists,
          ],
          text: 'MRA',
          linkId: randomUUID(),
        }),
        this.medicationClassPageItem({
          medications: input.medications,
          drugs: input.drugs,
          medicationClasses: [MedicationClassReference.sglt2inhibitors],
          text: 'SGLT2i',
          linkId: randomUUID(),
        }),
        this.medicationClassPageItem({
          medications: input.medications,
          drugs: input.drugs,
          medicationClasses: [MedicationClassReference.diuretics],
          text: 'Diuretics',
          linkId: randomUUID(),
        }),
        this.pageItem({
          text: 'Creatinine',
          item: [
            this.dateItem({
              linkId: randomUUID(),
              text: 'Date',
            }),
            this.decimalItem({
              linkId: randomUUID(),
              text: 'Creatinine',
              unit: 'mg/dL',
            }),
          ],
        }),
        this.pageItem({
          text: 'Potassium',
          item: [
            this.dateItem({
              linkId: randomUUID(),
              text: 'Date',
            }),
            this.decimalItem({
              linkId: randomUUID(),
              text: 'Potassium',
              unit: 'mEq/L',
            }),
          ],
        }),
        this.pageItem({
          text: 'Dry Weight',
          item: [
            this.dateItem({
              linkId: randomUUID(),
              text: 'Date',
            }),
            this.decimalItem({
              linkId: randomUUID(),
              text: 'Dry weight',
              unit: 'lbs',
            }),
          ],
        }),
      ],
    })
  }
}
