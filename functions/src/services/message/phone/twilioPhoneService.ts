//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { https } from 'firebase-functions'
import twilio from 'twilio'
import { type PhoneService } from './phoneService.js'

export class TwilioPhoneService implements PhoneService {
  // Properties

  private readonly client: twilio.Twilio
  private readonly senderPhoneNumber: string
  private readonly verifyServiceId: string

  // Constructor

  constructor(options: {
    verifyServiceId: string
    phoneNumber: string
    accountSid?: string
    authToken?: string
    options?: twilio.ClientOpts
  }) {
    this.client = twilio(options.accountSid, options.authToken, options.options)
    this.senderPhoneNumber = options.phoneNumber
    this.verifyServiceId = options.verifyServiceId
  }

  // Methods - Verification

  async startVerification(
    phoneNumber: string,
    options: {
      locale?: string
    },
  ): Promise<string> {
    const response = await this.client.verify.v2
      .services(this.verifyServiceId)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms',
        locale: options.locale,
      })

    return response.sid
  }

  async checkVerification(verificationId: string, code: string): Promise<void> {
    const response = await this.client.verify.v2
      .services(this.verifyServiceId)
      .verificationChecks.create({
        code,
        verificationSid: verificationId,
      })
    switch (response.status) {
      case 'approved':
        return
      case 'pending':
        throw new https.HttpsError(
          'internal',
          'Phone Number Verification is still pending.',
        )
      case 'canceled':
        throw new https.HttpsError(
          'internal',
          'Phone Number Verification was canceled.',
        )
      case 'expired':
        throw new https.HttpsError(
          'internal',
          'Phone Number Verification has expired.',
        )
      default:
        throw new https.HttpsError(
          'internal',
          'Phone Number Verification failed.',
        )
    }
  }

  // Methods - Text Messages

  async sendTextMessage(
    receiverPhoneNumber: string,
    message: string,
  ): Promise<void> {
    const response = await this.client.messages.create({
      body: message,
      from: this.senderPhoneNumber,
      to: receiverPhoneNumber,
    })
    switch (response.status) {
      case 'queued':
        return
      case 'failed':
        throw new https.HttpsError('internal', 'Text Message failed to send.')
      default:
        throw new https.HttpsError(
          'internal',
          'Text Message failed to send due to unknown reason.',
        )
    }
  }
}
