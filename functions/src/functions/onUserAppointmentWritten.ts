//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { fhirAppointmentConverter } from '@stanfordbdhg/engagehf-models'
import { onDocumentWritten } from 'firebase-functions/firestore'
import { Env } from '../env.js'
import { FHIRDatabaseConverter } from '../services/database/databaseConverter.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const onUserAppointmentWritten = onDocumentWritten(
  {
    document: 'users/{userId}/appointments/{appointmentId}',
    secrets: Env.twilioSecretKeys,
  },
  async (event) => {
    const data = event.data?.after
    const converter = new FHIRDatabaseConverter(fhirAppointmentConverter)
    const factory = getServiceFactory()
    const triggerService = factory.trigger()
    await triggerService.userAppointmentWritten(
      event.params.userId,
      event.params.appointmentId,
      data?.exists ? converter.fromFirestore(data) : null,
    )
  },
)
