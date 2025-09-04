//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  FhirQuestionnaireResponse as BaseFhirQuestionnaireResponse,
  questionnaireResponseSchema,
} from "@stanfordspezi/spezi-firebase-fhir";

export class FhirQuestionnaireResponse extends BaseFhirQuestionnaireResponse {
  // Static Properties

  static readonly schema = questionnaireResponseSchema.transform(
    (value) => new FhirQuestionnaireResponse(value),
  );

  // Static Functions

  static parse(value: unknown): FhirQuestionnaireResponse {
    return new FhirQuestionnaireResponse(
      questionnaireResponseSchema.parse(value),
    );
  }
}
