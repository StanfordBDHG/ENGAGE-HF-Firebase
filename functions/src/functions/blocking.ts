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
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const beforeUserCreatedFunction = beforeUserCreated(async (event) => {
  const userId = event.data.uid

  const factory = getServiceFactory()
  const userService = factory.user()

  // Escape hatch for users using invitation code to enroll
  if (event.credential === undefined) return

  if (event.data.email === undefined)
    throw new https.HttpsError(
      'invalid-argument',
      'Email address is required for user.',
    )

  const organization = await userService.getOrganizationBySsoProviderId(
    event.credential.providerId,
  )

  if (organization === undefined)
    throw new https.HttpsError('failed-precondition', 'Organization not found.')

  const invitation = await userService.getInvitationByCode(event.data.email)
  if (invitation?.content === undefined) {
    throw new https.HttpsError(
      'not-found',
      'No valid invitation code found for user.',
    )
  }

  if (
    invitation.content.user.type === UserType.admin &&
    invitation.content.user.organization !== organization.id
  )
    throw new https.HttpsError(
      'failed-precondition',
      'Organization does not match invitation code.',
    )

  await userService.enrollUser(invitation, userId)
  await factory.trigger().userEnrolled(userId)
})

export const beforeUserSignedInFunction = beforeUserSignedIn(async (event) => {
  try {
    const userService = getServiceFactory().user()
    await userService.updateClaims(event.data.uid)
    logger.info(`beforeUserSignedIn finished successfully.`)
  } catch (error) {
    logger.error(`beforeUserSignedIn finished with error: ${String(error)}`)
  }
})
