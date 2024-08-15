//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type Messaging, type TokenMessage } from 'firebase-admin/messaging'
import { https } from 'firebase-functions'
import { type MessageService } from './messageService.js'
import { advanceDateByDays } from '../../extensions/date.js'
import { type UserDevice } from '../../models/types/userDevice.js'
import { UserMessage, UserMessageType } from '../../models/types/userMessage.js'
import { Document, type DatabaseService } from '../database/databaseService.js'
import { QueryDocumentSnapshot } from 'firebase-admin/firestore'

export class DefaultMessageService implements MessageService {
  // Properties

  private readonly databaseService: DatabaseService
  private readonly messaging: Messaging

  // Constructor

  constructor(messaging: Messaging, databaseService: DatabaseService) {
    this.databaseService = databaseService
    this.messaging = messaging
  }

  // Methods

  async registerDevice(userId: string, device: UserDevice): Promise<void> {
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        const devices = await transaction.get(collections.userDevices(userId))
        const existingDevice = devices.docs.find(
          (doc) => doc.data().notificationToken === device.notificationToken,
        )
        transaction.set(
          existingDevice?.ref ?? collections.userDevices(userId).doc(),
          device,
        )
      },
    )
    return
  }

  async sendNotification(
    userId: string,
    message: UserMessage,
    options: {
      language?: string
    },
  ): Promise<void> {
    const devices = await this.databaseService.getQuery<UserDevice>(
      (collections) => collections.userDevices(userId),
    )

    const notifications: TokenMessage[] = devices.map((device) =>
      this.tokenMessage(message, {
        device: device.content,
        languages: [device.content.language, options.language].flatMap(
          (language) => (language ? [language] : []),
        ),
      }),
    )

    const batchResponse = await this.messaging.sendEach(notifications)

    await Promise.all(
      batchResponse.responses.map(async (individualResponse, index) => {
        if (!individualResponse.success) {
          console.error(
            `Tried sending message to ${devices[index].content.notificationToken} but failed: ${String(individualResponse.error)}`,
          )
        }
        if (
          individualResponse.error?.code !==
          'messaging/registration-token-not-registered'
        )
          return

        await this.databaseService.runTransaction(
          (collections, transaction) => {
            transaction.delete(
              collections.userDevices(userId).doc(devices[index].id),
            )
          },
        )
      }),
    )

    return
  }

  // Methods - Messages

  async getOpenMessages(userId: string): Promise<Document<UserMessage>[]> {
    return await this.databaseService.getQuery((collections) =>
      collections
        .userMessages(userId)
        .where('completionDate', '==', null)
        .orderBy('creationDate', 'desc'),
    )
  }

  async addMessage(userId: string, message: UserMessage): Promise<boolean> {
    return await this.databaseService.runTransaction(
      async (collections, transaction) => {
        const existingMessage = (
          await collections
            .userMessages(userId)
            .where('type', '==', message.type)
            .where('completionDate', '==', null)
            .orderBy('creationDate', 'desc')
            .limit(1)
            .get()
        ).docs.at(0)

        if (
          !existingMessage ||
          this.handleOldMessage(existingMessage, message, transaction)
        ) {
          const newMessageRef = collections.userMessages(userId).doc()
          transaction.set(newMessageRef, message)
          return true
        }

        return false
      },
    )
  }

  async completeMessages(
    userId: string,
    type: UserMessageType,
    filter?: (message: UserMessage) => boolean,
  ) {
    return await this.databaseService.runTransaction(
      async (collections, transaction) => {
        const messages = await transaction.get(
          collections
            .userMessages(userId)
            .where('type', '==', type)
            .where('completionDate', '==', null),
        )
        for (const message of messages.docs.filter(
          (doc) => filter?.(doc.data()) ?? true,
        )) {
          transaction.set(
            message.ref,
            new UserMessage({
              ...message.data(),
              completionDate: new Date(),
            }),
          )
        }
      },
    )
  }

  async dismissMessage(
    userId: string,
    messageId: string,
    didPerformAction: boolean,
  ): Promise<void> {
    console.log(
      `dismissMessage for user/${userId}/message/${messageId} with didPerformAction ${didPerformAction}`,
    )
    return await this.databaseService.runTransaction(
      async (collections, transaction) => {
        const messageRef = collections.userMessages(userId).doc(messageId)
        const message = await transaction.get(messageRef)
        const messageContent = message.data()
        if (!message.exists || !messageContent)
          throw new https.HttpsError('not-found', 'Message not found.')

        if (!messageContent.isDismissible)
          throw new https.HttpsError(
            'invalid-argument',
            'Message is not dismissible.',
          )

        transaction.set(
          messageRef,
          new UserMessage({
            ...messageContent,
            completionDate: new Date(),
          }),
        )
      },
    )
  }

  // Helpers

  /// returns whether to save the new message or throw it away
  private handleOldMessage(
    oldMessage: QueryDocumentSnapshot<UserMessage>,
    newMessage: UserMessage,
    transaction: FirebaseFirestore.Transaction,
  ): boolean {
    switch (newMessage.type) {
      case UserMessageType.weightGain: {
        const isOld =
          oldMessage.data().creationDate >= advanceDateByDays(new Date(), -7)
        if (isOld) {
          transaction.set(
            oldMessage.ref,
            new UserMessage({
              ...oldMessage.data(),
              completionDate: new Date(),
            }),
          )
          return true
        }
        return false
      }
      case UserMessageType.welcome:
      case UserMessageType.medicationChange:
      case UserMessageType.medicationUptitration: {
        return false
      }
      case UserMessageType.symptomQuestionnaire:
      case UserMessageType.vitals: {
        transaction.set(
          oldMessage.ref,
          new UserMessage({
            ...oldMessage.data(),
            completionDate: new Date(),
          }),
        )
        return true
      }
      case UserMessageType.preAppointment: {
        return true
      }
    }
  }

  private tokenMessage(
    message: UserMessage,
    options: {
      device: UserDevice
      languages: string[]
    },
  ): TokenMessage {
    const data: Record<string, string> = {}
    if (message.action) data.action = message.action
    data.type = message.type

    return {
      token: options.device.notificationToken,
      notification: {
        title: message.title.localize(...options.languages),
        body: message.description?.localize(...options.languages),
      },
      data: data,
      fcmOptions: {
        analyticsLabel: message.type,
      },
    }
  }
}
