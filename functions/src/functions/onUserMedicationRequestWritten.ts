//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { fhirMedicationRequestConverter } from '@stanfordbdhg/engagehf-models'
import { onDocumentWritten } from 'firebase-functions/firestore'
import { Env } from '../env.js'
import { serviceAccount } from './helpers.js'
import { DatabaseConverter } from '../services/database/databaseConverter.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const onUserMedicationRequestWritten = onDocumentWritten(
  {
    document: 'users/{userId}/medicationRequests/{medicationRequestId}',
    serviceAccount,
    secrets: Env.twilioSecretKeys,
  },
  async (event) => {
    const beforeData = event.data?.before
    const afterData = event.data?.after
    const converter = new DatabaseConverter(
      fhirMedicationRequestConverter.value,
    )
    const factory = getServiceFactory()
    const triggerService = factory.trigger()
    await triggerService.userMedicationRequestWritten(
      event.params.userId,
      event.params.medicationRequestId,
      beforeData?.exists ? converter.fromFirestore(beforeData) : undefined,
      afterData?.exists ? converter.fromFirestore(afterData) : undefined,
    )
  },
)
