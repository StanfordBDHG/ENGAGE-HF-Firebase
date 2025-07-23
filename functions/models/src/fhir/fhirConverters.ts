//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { z } from 'zod'
import { FHIRAllergyIntolerance } from './fhirAllergyIntolerance.js'
import { FHIRAppointment } from './fhirAppointment.js'
import { FHIRMedication } from './fhirMedication.js'
import { FHIRMedicationRequest } from './fhirMedicationRequest.js'
import { FHIRObservation } from './fhirObservation.js'
import { FHIRQuestionnaire } from './fhirQuestionnaire.js'
import { FHIRQuestionnaireResponse } from './fhirQuestionnaireResponse.js'
import { FHIRSchemaConverter } from '../helpers/fhirSchemaConverter.js'

export const fhirAllergyIntoleranceConverter =
  new FHIRSchemaConverter<FHIRAllergyIntolerance>(
    z.object({}).transform((data: any) => new FHIRAllergyIntolerance(data)),
    {
      nullProperties: [],
    },
  )
export const fhirAppointmentConverter =
  new FHIRSchemaConverter<FHIRAppointment>(
    z.object({}).transform((data: any) => new FHIRAppointment(data)),
    {
      nullProperties: [],
    },
  )

export const fhirMedicationConverter = new FHIRSchemaConverter<FHIRMedication>(
  z.object({}).transform((data: any) => new FHIRMedication(data)),
  {
    nullProperties: [],
  },
)

export const fhirMedicationRequestConverter =
  new FHIRSchemaConverter<FHIRMedicationRequest>(
    z.object({}).transform((data: any) => new FHIRMedicationRequest(data)),
    {
      nullProperties: [],
    },
  )

export const fhirObservationConverter =
  new FHIRSchemaConverter<FHIRObservation>(
    z.object({}).transform((data: any) => new FHIRObservation(data)),
    {
      nullProperties: [],
    },
  )

export const fhirQuestionnaireConverter =
  new FHIRSchemaConverter<FHIRQuestionnaire>(
    z.object({}).transform((data: any) => new FHIRQuestionnaire(data)),
    {
      nullProperties: [],
    },
  )

export const fhirQuestionnaireResponseConverter =
  new FHIRSchemaConverter<FHIRQuestionnaireResponse>(
    z.object({}).transform((data: any) => new FHIRQuestionnaireResponse(data)),
    {
      nullProperties: [],
    },
  )
