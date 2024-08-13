//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type UserDeviceRegistration } from '../../models/device.js'
import { type UserMessage } from '../../models/message.js'

export interface MessageService {
  // Notifications

  registerDevice(userId: string, device: UserDeviceRegistration): Promise<void>
  sendNotification(
    userId: string,
    message: UserMessage,
    options: {
      language?: string
    },
  ): Promise<void>

  // Messages

  addMessage(userId: string, message: UserMessage): Promise<boolean>

  dismissMessage(
    userId: string,
    messageId: string,
    didPerformAction: boolean,
  ): Promise<void>
}
