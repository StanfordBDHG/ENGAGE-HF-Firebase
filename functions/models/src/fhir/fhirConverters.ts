//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { FhirAllergyIntolerance } from "./fhirAllergyIntolerance.js";
import { FhirAppointment } from "./fhirAppointment.js";
import { FhirMedication } from "./fhirMedication.js";
import { FhirMedicationRequest } from "./fhirMedicationRequest.js";
import { FhirObservation } from "./fhirObservation.js";
import { FhirQuestionnaire } from "./fhirQuestionnaire.js";
import { FhirQuestionnaireResponse } from "./fhirQuestionnaireResponse.js";
import { FhirSchemaConverter } from "../helpers/fhirSchemaConverter.js";

export const fhirAllergyIntoleranceConverter =
  new FhirSchemaConverter<FhirAllergyIntolerance>(
    (data) => FhirAllergyIntolerance.parse(data),
    {
      nullProperties: [],
    },
  );

export const fhirAppointmentConverter =
  new FhirSchemaConverter<FhirAppointment>(
    (data) => FhirAppointment.parse(data),
    {
      nullProperties: [],
    },
  );

export const fhirMedicationConverter = new FhirSchemaConverter<FhirMedication>(
  (data) => FhirMedication.parse(data),
  {
    nullProperties: [],
  },
);

export const fhirMedicationRequestConverter =
  new FhirSchemaConverter<FhirMedicationRequest>(
    (data) => FhirMedicationRequest.parse(data),
    {
      nullProperties: [],
    },
  );

export const fhirObservationConverter =
  new FhirSchemaConverter<FhirObservation>(
    (data) => FhirObservation.parse(data),
    {
      nullProperties: [],
    },
  );

export const fhirQuestionnaireConverter =
  new FhirSchemaConverter<FhirQuestionnaire>(
    (data) => FhirQuestionnaire.parse(data),
    {
      nullProperties: [],
    },
  );

export const fhirQuestionnaireResponseConverter =
  new FhirSchemaConverter<FhirQuestionnaireResponse>(
    (data) => FhirQuestionnaireResponse.parse(data),
    {
      nullProperties: [],
    },
  );
