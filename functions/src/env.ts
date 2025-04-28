//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { defineSecret } from 'firebase-functions/params'

/* eslint-disable @typescript-eslint/no-extraneous-class */

enum SecretKey {
  WEB_FRONTEND_BASE_URL = 'WEB_FRONTEND_BASE_URL',
  TWILIO_PHONE_NUMBER = 'TWILIO_PHONE_NUMBER',
  TWILIO_ACCOUNT_SID = 'TWILIO_ACCOUNT_SID',
  TWILIO_API_KEY = 'TWILIO_API_KEY',
  TWILIO_API_SECRET = 'TWILIO_API_SECRET',
  TWILIO_VERIFY_SERVICE_ID = 'TWILIO_VERIFY_SERVICE_ID',
}

const twilioPhoneNumber = defineSecret(SecretKey.TWILIO_PHONE_NUMBER)
const twilioAccountSid = defineSecret(SecretKey.TWILIO_ACCOUNT_SID)
const twilioApiKey = defineSecret(SecretKey.TWILIO_API_KEY)
const twilioApiSecret = defineSecret(SecretKey.TWILIO_API_SECRET)
const twilioVerifyServiceId = defineSecret(SecretKey.TWILIO_VERIFY_SERVICE_ID)
const webFrontendBaseUrl = defineSecret(SecretKey.WEB_FRONTEND_BASE_URL)

export class Env {
  static get twilioSecretKeys(): string[] {
    return [
      SecretKey.TWILIO_PHONE_NUMBER,
      SecretKey.TWILIO_ACCOUNT_SID,
      SecretKey.TWILIO_API_KEY,
      SecretKey.TWILIO_API_SECRET,
      SecretKey.TWILIO_VERIFY_SERVICE_ID,
    ]
  }

  static get webFrontendBaseUrlSecretKey(): string {
    return SecretKey.WEB_FRONTEND_BASE_URL
  }

  static get webFrontendBaseUrl(): string {
    return webFrontendBaseUrl.value()
  }

  static get twilioAccountSid(): string {
    return twilioAccountSid.value()
  }
  static get twilioPhoneNumber(): string {
    return twilioPhoneNumber.value()
  }
  static get twilioApiKey(): string {
    return twilioApiKey.value()
  }
  static get twilioApiSecret(): string {
    return twilioApiSecret.value()
  }
  static get twilioVerifiyServiceId(): string {
    return twilioVerifyServiceId.value()
  }
}
