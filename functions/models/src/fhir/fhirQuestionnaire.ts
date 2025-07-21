//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { Questionnaire } from 'fhir/r4b.js'
import { FHIRResource } from './fhirResource'

export class FHIRQuestionnaire extends FHIRResource<Questionnaire> {}
