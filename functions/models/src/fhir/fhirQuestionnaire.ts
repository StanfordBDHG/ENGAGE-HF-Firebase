//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { Questionnaire } from 'fhir/r4b.js'
import { FHIRResource } from './fhirResource.js'
import { questionnaireSchema } from 'spezi-firebase-fhir'
import { FHIRSchemaConverter } from '../helpers/fhirSchemaConverter.js'

export class FHIRQuestionnaire extends FHIRResource<Questionnaire> {}

/*
export const fhirQuestionnaireConverter =
  new FHIRSchemaConverter<FHIRQuestionnaire>({
    schema: questionnaireSchema.transform(
      (data) => new FHIRQuestionnaire(data),
    ),
    nullProperties: ['date'],
  })
*/