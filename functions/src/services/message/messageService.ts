//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  UserDevicePlatform,
  type User,
  type UserDevice,
  type UserMessage,
  type UserMessageType,
} from '@stanfordbdhg/engagehf-models'
import { type Document } from '../database/databaseService.js'

export interface MessageService {
  // Notifications

  registerDevice(userId: string, device: UserDevice): Promise<void>
  unregisterDevice(
    userId: string,
    notificationToken: string,
    platform: UserDevicePlatform,
  ): Promise<void>

  // Messages

  addMessage(
    userId: string,
    message: UserMessage,
    options: {
      notify: boolean
      user?: User | null
    },
  ): Promise<void>

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
