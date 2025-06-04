//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  fhirAppointmentConverter,
  fhirMedicationRequestConverter,
  fhirQuestionnaireResponseConverter,
  UserObservationCollection,
} from '@stanfordbdhg/engagehf-models'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { Env } from '../env.js'
import { DatabaseConverter } from '../services/database/databaseConverter.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const onUserAllergyIntoleranceWritten = onDocumentWritten(
  {
    document: 'users/{userId}/allergyIntolerances/{allergyIntoleranceId}',
    secrets: Env.twilioSecretKeys,
  },
  async (event) =>
    getServiceFactory()
      .trigger()
      .userAllergyIntoleranceWritten(event.params.userId),
)

export const onUserAppointmentWritten = onDocumentWritten(
  {
    document: 'users/{userId}/appointments/{appointmentId}',
    secrets: Env.twilioSecretKeys,
  },
  async (event) => {
    const data = event.data?.after
    const converter = new DatabaseConverter(fhirAppointmentConverter.value)
    await getServiceFactory()
      .trigger()
      .userAppointmentWritten(
        event.params.userId,
        event.params.appointmentId,
        data?.exists ? converter.fromFirestore(data) : null,
      )
  },
)

export const onUserCreatinineObservationWritten = onDocumentWritten(
  {
    document: 'users/{userId}/creatinineObservations/{observationId}',
    secrets: Env.twilioSecretKeys,
  },
  async (event) =>
    getServiceFactory()
      .trigger()
      .userObservationWritten(
        event.params.userId,
        UserObservationCollection.creatinine,
      ),
)

export const onUserBloodPressureObservationWritten = onDocumentWritten(
  {
    document: 'users/{userId}/bloodPressureObservations/{observationId}',
    secrets: Env.twilioSecretKeys,
  },
  async (event) =>
    getServiceFactory()
      .trigger()
      .userObservationWritten(
        event.params.userId,
        UserObservationCollection.bloodPressure,
      ),
)

export const onUserBodyWeightObservationWritten = onDocumentWritten(
  {
    document: 'users/{userId}/bodyWeightObservations/{observationId}',
    secrets: Env.twilioSecretKeys,
  },
  async (event) =>
    getServiceFactory()
      .trigger()
      .userObservationWritten(
        event.params.userId,
        UserObservationCollection.bodyWeight,
      ),
)

export const onUserDryWeightObservationWritten = onDocumentWritten(
  {
    document: 'users/{userId}/dryWeightObservations/{observationId}',
    secrets: Env.twilioSecretKeys,
  },
  async (event) =>
    getServiceFactory()
      .trigger()
      .userObservationWritten(
        event.params.userId,
        UserObservationCollection.dryWeight,
      ),
)

export const onUserEgfrObservationWritten = onDocumentWritten(
  {
    document: 'users/{userId}/eGfrObservations/{observationId}',
    secrets: Env.twilioSecretKeys,
  },
  async (event) =>
    getServiceFactory()
      .trigger()
      .userObservationWritten(
        event.params.userId,
        UserObservationCollection.eGfr,
      ),
)

export const onUserHeartRateObservationWritten = onDocumentWritten(
  {
    document: 'users/{userId}/heartRateObservations/{observationId}',
    secrets: Env.twilioSecretKeys,
  },
  async (event) =>
    getServiceFactory()
      .trigger()
      .userObservationWritten(
        event.params.userId,
        UserObservationCollection.heartRate,
      ),
)

export const onUserMedicationRequestWritten = onDocumentWritten(
  {
    document: 'users/{userId}/medicationRequests/{medicationRequestId}',
    secrets: Env.twilioSecretKeys,
  },
  async (event) => {
    const beforeData = event.data?.before
    const afterData = event.data?.after
    const converter = new DatabaseConverter(
      fhirMedicationRequestConverter.value,
    )
    await getServiceFactory()
      .trigger()
      .userMedicationRequestWritten(
        event.params.userId,
        event.params.medicationRequestId,
        beforeData?.exists ? converter.fromFirestore(beforeData) : undefined,
        afterData?.exists ? converter.fromFirestore(afterData) : undefined,
      )
  },
)

export const onUserPotassiumObservationWritten = onDocumentWritten(
  {
    document: 'users/{userId}/potassiumObservations/{observationId}',
    secrets: Env.twilioSecretKeys,
  },
  async (event) =>
    getServiceFactory()
      .trigger()
      .userObservationWritten(
        event.params.userId,
        UserObservationCollection.potassium,
      ),
)

export const onUserQuestionnaireResponseWritten = onDocumentWritten(
  {
    document: 'users/{userId}/questionnaireResponses/{questionnaireResponseId}',
    secrets: Env.twilioSecretKeys,
  },
  async (event) => {
    const beforeData = event.data?.before
    const afterData = event.data?.after
    const converter = new DatabaseConverter(
      fhirQuestionnaireResponseConverter.value,
    )
    await getServiceFactory()
      .trigger()
      .questionnaireResponseWritten(
        event.params.userId,
        event.params.questionnaireResponseId,
        beforeData?.exists ? converter.fromFirestore(beforeData) : undefined,
        afterData?.exists ? converter.fromFirestore(afterData) : undefined,
      )
  },
)
