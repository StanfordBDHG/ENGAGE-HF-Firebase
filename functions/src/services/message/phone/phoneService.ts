//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

export interface PhoneService {
  startVerification(
    phoneNumber: string,
    options: {
      locale?: string
    },
  ): Promise<void>

  checkVerification(verificationId: string, code: string): Promise<void>

  sendTextMessage(phoneNumber: string, message: string): Promise<void>
}
