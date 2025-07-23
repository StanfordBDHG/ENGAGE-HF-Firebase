//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  allergyIntoleranceSchema,
  appointmentSchema,
  medicationSchema,
  medicationRequestSchema,
  observationSchema,
  questionnaireSchema,
  questionnaireResponseSchema,
} from '@stanfordspezi/spezi-firebase-fhir'
import { ZodType } from 'zod/v4'
import { FHIRAllergyIntolerance } from './fhirAllergyIntolerance.js'
import { FHIRAppointment } from './fhirAppointment.js'
import { FHIRSchemaConverter } from '../helpers/fhirSchemaConverter.js'

/*
const aiSchema: ZodType<FHIRAllergyIntolerance> =
  allergyIntoleranceSchema.transform((data) => new FHIRAllergyIntolerance(data))

export const fhirAllergyIntoleranceConverter =
  new FHIRSchemaConverter<FHIRAllergyIntolerance>(aiSchema, {
    nullProperties: [],
  })
export const fhirAppointmentConverter =
  new FHIRSchemaConverter<FHIRAppointment>(
    appointmentSchema.transform((data) => new FHIRAppointment(data)),
    {
      nullProperties: [],
    },
  )

export const fhirMedicationConverter = new FHIRSchemaConverter<FHIRMedication>(
  medicationSchema.transform((data) => new FHIRMedication(data)),
  {
    nullProperties: [],
  },
)

export const fhirMedicationRequestConverter =
  new FHIRSchemaConverter<FHIRMedicationRequest>(
    medicationRequestSchema.transform(
      (data) => new FHIRMedicationRequest(data),
    ),
    {
      nullProperties: [],
    },
  )

export const fhirObservationConverter =
  new FHIRSchemaConverter<FHIRObservation>(
    observationSchema.transform((data) => new FHIRObservation(data)),
    {
      nullProperties: [],
    },
  )

export const fhirQuestionnaireConverter =
  new FHIRSchemaConverter<FHIRQuestionnaire>(
    questionnaireSchema.transform((data) => new FHIRQuestionnaire(data)),
    {
      nullProperties: [],
    },
  )

export const fhirQuestionnaireResponseConverter =
  new FHIRSchemaConverter<FHIRQuestionnaireResponse>(
    questionnaireResponseSchema.transform(
      (data) => new FHIRQuestionnaireResponse(data),
    ),
    {
      nullProperties: [],
    },
  )
*/
