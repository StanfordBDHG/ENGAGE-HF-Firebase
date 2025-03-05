//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { defineSecret } from 'firebase-functions/params'

/* eslint-disable @typescript-eslint/no-extraneous-class */

const twilioPhoneNumber = defineSecret('TWILIO_PHONE_NUMBER')
const twilioAccountSid = defineSecret('TWILIO_ACCOUNT_SID')
const twilioAuthToken = defineSecret('TWILIO_AUTH_TOKEN')
const twilioVerifyServiceId = defineSecret('TWILIO_VERIFY_SERVICE_ID')

export class Env {
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
