//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { randomUUID } from 'crypto'
import { PhoneService } from './phoneService.js'
import { Lazy } from '@stanfordbdhg/engagehf-models'

interface MockPhoneMessage {
  phoneNumber: string
  message: string
  date: Date
}

interface MockPhoneVerification {
  phoneNumber: string
  code: string
}

export class MockPhoneService implements PhoneService {
  // Static Properties

  // Unfortunately, there doesn't seem to be a way to realistically mock verification codes,
  // since the tests couldn't access randomly generated ones,
  // which is why it's always using this static code.
  static readonly correctCode = '012345'
  static readonly incorrectCode = '543210'

  private static readonly lazyInstance = new Lazy(() => new MockPhoneService())

  static get instance(): MockPhoneService {
    return this.lazyInstance.value
  }

  // Properties

  private verifications = new Map<string, MockPhoneVerification>()
  private verifiedPhoneNumbers = new Set<string>()
  private messages: MockPhoneMessage[] = []

  // Constructors

  private constructor() {}

  // Methods

  async startVerification(
    phoneNumber: string,
    options: { locale?: string },
  ): Promise<string> {
    const verificationId = randomUUID()
    this.verifications.set(verificationId, {
      phoneNumber,
      code: MockPhoneService.correctCode,
    })
    return verificationId
  }

  async checkVerification(verificationId: string, code: string): Promise<void> {
    const verification = this.verifications.get(verificationId)
    if (verification === undefined || verification.code !== code) {
      throw new Error('Invalid verification code')
    } else {
      this.verifiedPhoneNumbers.add(verification.phoneNumber)
    }
  }

  async sendTextMessage(phoneNumber: string, message: string): Promise<void> {
    if (!this.verifiedPhoneNumbers.has(phoneNumber)) {
      throw new Error('Phone number not verified')
    }
    this.messages.push({ phoneNumber, message, date: new Date() })
  }
}
