//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { defineSecret } from 'firebase-functions/params'

/* eslint-disable @typescript-eslint/no-extraneous-class */

enum TwilioSecrets {
  TWILIO_PHONE_NUMBER = 'TWILIO_PHONE_NUMBER',
  TWILIO_ACCOUNT_SID = 'TWILIO_ACCOUNT_SID',
  TWILIO_AUTH_TOKEN = 'TWILIO_AUTH_TOKEN',
  TWILIO_VERIFY_SERVICE_ID = 'TWILIO_VERIFY_SERVICE_ID',
}

const twilioPhoneNumber = defineSecret(TwilioSecrets.TWILIO_PHONE_NUMBER)
const twilioAccountSid = defineSecret(TwilioSecrets.TWILIO_ACCOUNT_SID)
const twilioAuthToken = defineSecret(TwilioSecrets.TWILIO_AUTH_TOKEN)
const twilioVerifyServiceId = defineSecret(
  TwilioSecrets.TWILIO_VERIFY_SERVICE_ID,
)

export class Env {
  static get twilioSecretKeys() {
    return Object.values(TwilioSecrets)
  }

  static get TWILIO_ACCOUNT_SID() {
    return twilioAccountSid.value()
  }
  static get TWILIO_PHONE_NUMBER() {
    return twilioPhoneNumber.value()
  }
  static get TWILIO_AUTH_TOKEN() {
    return twilioAuthToken.value()
  }
  static get TWILIO_VERIFY_SERVICE_ID() {
    return twilioVerifyServiceId.value()
  }
}
