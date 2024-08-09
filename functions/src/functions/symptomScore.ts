//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const onUserQuestionnaireResponseWritten = onDocumentWritten(
  'users/{userId}/questionnaireResponses/{questionnaireResponseId}',
  async (event) =>
    getServiceFactory()
      .trigger()
      .questionnaireResponseWritten(
        event.params.userId,
        event.params.questionnaireResponseId,
        event.data?.after.data(),
      ),
)
