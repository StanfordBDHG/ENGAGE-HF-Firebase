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
  FHIRQuestionnaireItem,
  MedicationClassReference,
  QuantityUnit,
} from '@stanfordbdhg/engagehf-models'
import { QuestionnaireFactory } from './QuestionnaireFactory.js'
import { randomUUID } from 'crypto'

interface DataUpdateQuestionnaireFactoryInput {
  medications: Record<string, FHIRMedication>
  drugs: Record<string, Record<string, FHIRMedication>>
  isPostVisit: boolean
}

export class DataUpdateQuestionnaireFactory extends QuestionnaireFactory<DataUpdateQuestionnaireFactoryInput> {
  // Methods

  create(input: DataUpdateQuestionnaireFactoryInput): FHIRQuestionnaire {
    return this.questionnaire({
      id: randomUUID(),
      title: input.isPostVisit ? 'Post-Visit Survey' : 'Update Survey',
      item: [
        ...this.labInputPages({}),
        ...this.medicationInputPages({
          medications: input.medications,
          drugs: input.drugs,
        }),
      ],
    })
  }
}
