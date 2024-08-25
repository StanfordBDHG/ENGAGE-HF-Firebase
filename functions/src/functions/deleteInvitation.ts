//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { https } from 'firebase-functions'
import { validatedOnCall } from './helpers.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'
import { UserRole } from '../services/credential/credential.js'
import { deleteInvitationInputSchema } from '@stanfordbdhg/engagehf-models'

export const deleteInvitation = validatedOnCall(
  deleteInvitationInputSchema,
  async (request): Promise<void> => {
    if (!request.auth?.uid)
      throw new https.HttpsError('unauthenticated', 'User is not authenticated')

    const factory = getServiceFactory()
    const credential = factory.credential(request.auth)
    const userService = factory.user()
    try {
      credential.check(UserRole.admin)
    } catch {
      const invitation = await userService.getInvitationByCode(
        request.data.invitationCode,
      )
      if (!invitation?.content.user.organization)
        throw credential.permissionDeniedError()
      credential.check(
        UserRole.owner(invitation.content.user.organization),
        UserRole.clinician(invitation.content.user.organization),
      )
    }
    await userService.deleteInvitation(request.data.invitationCode)
  },
)
