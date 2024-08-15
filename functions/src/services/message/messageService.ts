//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type UserDevice } from '../../models/types/userDevice.js'
import {
  type UserMessageType,
  type UserMessage,
} from '../../models/types/userMessage.js'
import { type Document } from '../database/databaseService.js'

export interface MessageService {
  // Notifications

  registerDevice(userId: string, device: UserDevice): Promise<void>
  sendNotification(
    userId: string,
    message: UserMessage,
    options: {
      language?: string
    },
  ): Promise<void>

  // Messages

  addMessage(userId: string, message: UserMessage): Promise<boolean>

  getOpenMessages(userId: string): Promise<Array<Document<UserMessage>>>

  completeMessages(
    userId: string,
    type: UserMessageType,
    filter?: (message: UserMessage) => boolean,
  ): Promise<void>

  dismissMessage(
    userId: string,
    messageId: string,
    didPerformAction: boolean,
  ): Promise<void>
}
