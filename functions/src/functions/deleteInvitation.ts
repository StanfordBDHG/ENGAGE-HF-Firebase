//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { deleteInvitationInputSchema } from '@stanfordbdhg/engagehf-models'
import { https } from 'firebase-functions'
import { validatedOnCall } from './helpers.js'
import { UserRole } from '../services/credential/credential.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const deleteInvitation = validatedOnCall(
  deleteInvitationInputSchema,
  async (request): Promise<void> => {
    if (!request.auth?.uid)
      throw new https.HttpsError('unauthenticated', 'User is not authenticated')

    const factory = getServiceFactory()
    const credential = factory.credential(request.auth)
    const userService = factory.user()
    const invitation = await userService.getInvitationByCode(
      request.data.invitationCode,
    )
    if (!invitation?.content.user.organization)
      throw credential.permissionDeniedError()

    credential.check(
      UserRole.admin,
      UserRole.owner(invitation.content.user.organization),
      UserRole.clinician(invitation.content.user.organization),
    )

    await userService.deleteInvitation(invitation)
  },
)