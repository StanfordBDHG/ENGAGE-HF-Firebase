//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  checkPhoneNumberVerificationInputSchema,
  CheckPhoneNumberVerificationOutput,
  deletePhoneNumberInputSchema,
  DeletePhoneNumberOutput,
  startPhoneNumberVerificationInputSchema,
  StartPhoneNumberVerificationOutput,
} from '@stanfordbdhg/engagehf-models'
import { validatedOnCall } from './helpers.js'
import { getServiceFactory } from '../services/factory/getServiceFactory.js'

export const startPhoneNumberVerification = validatedOnCall(
  'startPhoneNumberVerification',
  startPhoneNumberVerificationInputSchema,
  async (request): Promise<StartPhoneNumberVerificationOutput> => {
    const factory = getServiceFactory()
    const credential = factory.credential(request.auth)
    await factory
      .message()
      .startPhoneNumberVerification(credential.userId, request.data.phoneNumber)
  },
)

export const checkPhoneNumberVerification = validatedOnCall(
  'checkPhoneNumberVerification',
  checkPhoneNumberVerificationInputSchema,
  async (request): Promise<CheckPhoneNumberVerificationOutput> => {
    const factory = getServiceFactory()
    const credential = factory.credential(request.auth)
    await factory
      .message()
      .checkPhoneNumberVerification(
        credential.userId,
        request.data.phoneNumber,
        request.data.code,
      )
  },
)

export const deletePhoneNumber = validatedOnCall(
  'deletePhoneNumber',
  deletePhoneNumberInputSchema,
  async (request): Promise<DeletePhoneNumberOutput> => {
    const factory = getServiceFactory()
    const credential = factory.credential(request.auth)
    await factory
      .message()
      .deletePhoneNumber(credential.userId, request.data.phoneNumber)
  },
)
