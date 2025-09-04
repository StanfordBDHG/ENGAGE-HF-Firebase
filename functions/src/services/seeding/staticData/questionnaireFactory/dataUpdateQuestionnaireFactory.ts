//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  type FhirMedication,
  type FhirQuestionnaire,
} from "@stanfordbdhg/engagehf-models";
import { QuestionnaireFactory } from "./questionnaireFactory.js";
import { QuestionnaireId } from "./questionnaireLinkIds.js";

interface DataUpdateQuestionnaireFactoryInput {
  medications: Record<string, FhirMedication>;
  drugs: Record<string, Record<string, FhirMedication>>;
  isPostAppointment: boolean;
}

export class DataUpdateQuestionnaireFactory extends QuestionnaireFactory<DataUpdateQuestionnaireFactoryInput> {
  // Methods

  create(input: DataUpdateQuestionnaireFactoryInput): FhirQuestionnaire {
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
