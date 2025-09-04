//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type FhirQuestionnaireResponse } from "@stanfordbdhg/engagehf-models";
import { QuestionnaireResponseService } from "./questionnaireResponseService.js";
import { type Document } from "../database/databaseService.js";

export class MultiQuestionnaireResponseService extends QuestionnaireResponseService {
  // Properties

  private readonly components: QuestionnaireResponseService[];

  // Constructor

  constructor(components: QuestionnaireResponseService[]) {
    super();
    this.components = components;
  }

  // Methods

  async handle(
    userId: string,
    response: Document<FhirQuestionnaireResponse>,
    options: { isNew: boolean },
  ): Promise<boolean> {
    for (const components of this.components) {
      const handled = await components.handle(userId, response, options);
      if (handled) return true;
    }
    return false;
  }
}
