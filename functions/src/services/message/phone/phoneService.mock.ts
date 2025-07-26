//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { dateTimeConverter } from '@stanfordbdhg/engagehf-models'
import { type PhoneService } from './phoneService.js'
import { type DatabaseService } from '../../database/databaseService.js'

interface MockPhoneMessage {
  phoneNumber: string
  message: string
  date: string
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

  // Properties

  private readonly databaseService: DatabaseService

  // Constructors

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService
  }

  // Methods

  async startVerification(
    phoneNumber: string,
    options: { locale?: string },
  ): Promise<void> {
    const verification: MockPhoneVerification = {
      phoneNumber,
      code: MockPhoneService.correctCode,
    }
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        transaction.set(
          collections.firestore
            .collection('mockPhoneNumberVerifications')
            .doc(phoneNumber),
          verification,
        )
      },
    )
  }

  async checkVerification(phoneNumber: string, code: string): Promise<void> {
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        const query = collections.firestore
          .collection('mockPhoneNumberVerifications')
          .where('phoneNumber', '==', phoneNumber)
        const snapshot = await transaction.get(query)
        if (snapshot.docs.length === 0) {
          throw new Error('Phone number verification not found.')
        } else if (snapshot.docs.length > 1) {
          throw new Error('Multiple phone number verifications found.')
        }
        const verificationDoc = snapshot.docs[0]
        const verification = verificationDoc.data() as MockPhoneVerification
        if (verification.code === code) {
          transaction.delete(verificationDoc.ref)
        } else {
          throw new Error('Invalid verification code.')
        }
      },
    )
  }

  async sendTextMessage(phoneNumber: string, message: string): Promise<void> {
    const mockPhoneMessage: MockPhoneMessage = {
      phoneNumber,
      message,
      date: dateTimeConverter.encode(new Date()),
    }
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        transaction.set(
          collections.firestore.collection('mockPhoneMessages').doc(),
          mockPhoneMessage,
        )
      },
    )
  }
}
