//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  FhirQuestionnaire as BaseFhirQuestionnaire,
  questionnaireSchema,
} from "@stanfordspezi/spezi-firebase-fhir";

export class FhirQuestionnaire extends BaseFhirQuestionnaire {
  // Static Properties

  static readonly schema = questionnaireSchema.transform(
    (value) => new FhirQuestionnaire(value),
  );

  // Static Functions

  static parse(value: unknown): FhirQuestionnaire {
    return new FhirQuestionnaire(questionnaireSchema.parse(value));
  }
}
