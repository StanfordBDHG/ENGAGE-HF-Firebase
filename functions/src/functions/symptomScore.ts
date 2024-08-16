//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { fhirQuestionnaireResponseConverter } from '../models/fhir/fhirQuestionnaireResponse.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const onUserQuestionnaireResponseWritten = onDocumentWritten(
  'users/{userId}/questionnaireResponses/{questionnaireResponseId}',
  async (event) => {
    const beforeData = event.data?.before
    const afterData = event.data?.after
    await getServiceFactory()
      .trigger()
      .questionnaireResponseWritten(
        event.params.userId,
        event.params.questionnaireResponseId,
        beforeData?.exists ?
          fhirQuestionnaireResponseConverter.value.fromFirestore(beforeData)
        : undefined,
        afterData?.exists ?
          fhirQuestionnaireResponseConverter.value.fromFirestore(afterData)
        : undefined,
      )
  },
)
