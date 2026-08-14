//
// This source file is part of the ENGAGE-HF Firebase open-source project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type FHIRMedication,
  type FHIRQuestionnaire,
} from "@schmiedmayerlab/engagehf-models";
import { QuestionnaireFactory } from "./questionnaireFactory.js";
import { QuestionnaireId } from "./questionnaireLinkIds.js";

interface DataUpdateQuestionnaireFactoryInput {
  medications: Record<string, FHIRMedication>;
  drugs: Record<string, Record<string, FHIRMedication>>;
  isPostAppointment: boolean;
}

export class DataUpdateQuestionnaireFactory extends QuestionnaireFactory<DataUpdateQuestionnaireFactoryInput> {
  // Methods

  create(input: DataUpdateQuestionnaireFactoryInput): FHIRQuestionnaire {
    return this.questionnaire({
      id:
        input.isPostAppointment ?
          QuestionnaireId.postAppointment
        : QuestionnaireId.dataUpdate,
      title:
        input.isPostAppointment ? "Post-Appointment Survey" : "Update Survey",
      item: [
        ...this.labInputPages(),
        ...this.medicationInputPages({
          medications: input.medications,
          drugs: input.drugs,
          isRegistration: false,
        }),
        ...this.appointmentInputPages(),
      ],
    });
  }
}
