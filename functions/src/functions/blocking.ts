//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { UserType } from '@stanfordbdhg/engagehf-models'
import { https, logger } from 'firebase-functions'
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from 'firebase-functions/v2/identity'
import { serviceAccount } from './helpers.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const beforeUserCreatedFunction = beforeUserCreated(
  { serviceAccount: serviceAccount },
  async (event) => {
    const userId = event.data.uid

    const factory = getServiceFactory()
    const userService = factory.user()
    const credential = event.credential

    // Escape hatch for users using invitation code to enroll
    if (!credential) return { customClaims: {} }

    if (event.data.email === undefined)
      throw new https.HttpsError(
        'invalid-argument',
        'Email address is required for user.',
      )

    const organization = await userService.getOrganizationBySsoProviderId(
      credential.providerId,
    )

    if (organization === undefined)
      throw new https.HttpsError(
        'failed-precondition',
        'Organization not found.',
      )

    const invitation = await userService.getInvitationByCode(event.data.email)
    if (invitation?.content === undefined) {
      throw new https.HttpsError(
        'not-found',
        'No valid invitation code found for user.',
      )
    }

    if (
      invitation.content.user.type !== UserType.admin &&
      invitation.content.user.organization !== organization.id
    )
      throw new https.HttpsError(
        'failed-precondition',
        'Organization does not match invitation code.',
      )

    const userDoc = await userService.enrollUser(invitation, userId, {
      isSingleSignOn: true,
    })
    await factory.trigger().userEnrolled(userDoc)

    return { customClaims: invitation.content.user.claims }
  },
)

export const beforeUserSignedInFunction = beforeUserSignedIn(
  { serviceAccount: serviceAccount },
  async (event) => {
    try {
      const userService = getServiceFactory().user()
      const user = await userService.getUser(event.data.uid)
      if (user !== undefined) {
        logger.info(`beforeUserSignedIn finished successfully.`)
        return { customClaims: user.content.claims }
      }
      logger.info(`beforeUserSignedIn finished without user.`)
      return { customClaims: {} }
    } catch (error) {
      logger.error(`beforeUserSignedIn finished with error: ${String(error)}`)
      return { customClaims: {} }
    }
  },
)
