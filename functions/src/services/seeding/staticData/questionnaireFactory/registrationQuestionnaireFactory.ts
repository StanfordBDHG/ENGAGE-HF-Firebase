//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  UserSex,
  type FHIRMedication,
  type FHIRQuestionnaire,
} from "@stanfordbdhg/engagehf-models";
import { QuestionnaireFactory } from "./questionnaireFactory.js";
import {
  QuestionnaireId,
  QuestionnaireLinkId,
} from "./questionnaireLinkIds.js";

interface RegistrationQuestionnaireFactoryInput {
  medications: Record<string, FHIRMedication>;
  drugs: Record<string, Record<string, FHIRMedication>>;
}

export class RegistrationQuestionnaireFactory extends QuestionnaireFactory<RegistrationQuestionnaireFactoryInput> {
  create(input: RegistrationQuestionnaireFactoryInput): FHIRQuestionnaire {
    return this.questionnaire({
      id: QuestionnaireId.registration,
      title: "Registration Survey",
      item: [
        this.displayItem({
          linkId: QuestionnaireLinkId.welcome,
          text: "Welcome to the ENGAGE-HF study! Please complete the following survey to help us understand your health and well-being.",
        }),
        this.personalInformationPage(),
        ...this.labInputPages(),
        ...this.medicationInputPages({
          medications: input.medications,
          drugs: input.drugs,
          isRegistration: true,
        }),
        ...this.appointmentInputPages(),
      ],
    });
  }

  // Helpers

  private personalInformationPage() {
    const linkIds = QuestionnaireLinkId.personalInformation

    return this.pageItem({
      linkId: linkIds.page,
      text: "Personal information",
      item: [
        this.displayItem({
          linkId: linkIds.description,
          text: "Please provide the following information to help us understand your health and well-being.",
        }),
        this.dateItem({
          linkId: linkIds.dateOfBirth,
          text: "Date of Birth",
        }),
        this.radioButtonItem({
          linkId: linkIds.sex,
          text: "Select your sex assigned at birth:",
          answerOption: this.valueSetAnswerOptions({
            system: "engage-hf-sex",
            values: Object.values(UserSex).map((value) => ({
              code: value,
              display: this.userSexDisplay(value),
            })),
          }),
        }),
      ],
    });
  }

  private userSexDisplay(sex: UserSex): string {
    switch (sex) {
      case UserSex.male:
        return "Male";
      case UserSex.female:
        return "Female";
    }
  }
}
