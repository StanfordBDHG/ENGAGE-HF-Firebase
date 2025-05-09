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
import { QuestionnaireId } from './questionnaireLinkIds.js'

interface DataUpdateQuestionnaireFactoryInput {
  medications: Record<string, FHIRMedication>
  drugs: Record<string, Record<string, FHIRMedication>>
  isPostVisit: boolean
}

export class DataUpdateQuestionnaireFactory extends QuestionnaireFactory<DataUpdateQuestionnaireFactoryInput> {
  // Methods

  create(input: DataUpdateQuestionnaireFactoryInput): FHIRQuestionnaire {
    return this.questionnaire({
      id:
        input.isPostVisit ?
          QuestionnaireId.postVisit
        : QuestionnaireId.dataUpdate,
      title: input.isPostVisit ? 'Post-Visit Survey' : 'Update Survey',
      item: [
        ...this.labInputPages(),
        ...this.medicationInputPages({
          medications: input.medications,
          drugs: input.drugs,
        }),
        ...this.appointmentInputPages(),
      ],
    })
  }
}
