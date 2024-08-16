//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { type Messaging, type TokenMessage } from 'firebase-admin/messaging'
import { https } from 'firebase-functions'
import { type MessageService } from './messageService.js'
import { advanceDateByDays } from '../../extensions/date.js'
import { type UserDevice } from '../../models/types/userDevice.js'
import { UserMessage, UserMessageType } from '../../models/types/userMessage.js'
import {
  type Document,
  type DatabaseService,
} from '../database/databaseService.js'
import { type UserService } from '../user/userService.js'

export class DefaultMessageService implements MessageService {
  // Properties

  private readonly databaseService: DatabaseService
  private readonly messaging: Messaging
  private readonly userService: UserService

  // Constructor

  constructor(
    messaging: Messaging,
    databaseService: DatabaseService,
    userService: UserService,
  ) {
    this.databaseService = databaseService
    this.messaging = messaging
    this.userService = userService
  }

  // Methods - Devices

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

  // Methods - Messages

  async getOpenMessages(userId: string): Promise<Array<Document<UserMessage>>> {
    return this.databaseService.getQuery((collections) =>
      collections
        .userMessages(userId)
        .where('completionDate', '==', null)
        .orderBy('creationDate', 'desc'),
    )
  }

  async addMessage(
    userId: string,
    message: UserMessage,
    options: {
      notify: boolean
      language?: string | null
    },
  ): Promise<void> {
    const didAddMessage = await this.databaseService.runTransaction(
      async (collections, transaction) => {
        const existingMessages = (
          await collections
            .userMessages(userId)
            .where('type', '==', message.type)
            .where('completionDate', '==', null)
            .orderBy('creationDate', 'desc')
            .get()
        ).docs

        if (
          existingMessages.length === 0 ||
          this.handleOldMessages(existingMessages, message, transaction)
        ) {
          const newMessageRef = collections.userMessages(userId).doc()
          transaction.set(newMessageRef, message)
          return true
        }

        return false
      },
    )

    if (didAddMessage && options.notify) {
      let language = options.language
      if (language === undefined)
        language = (await this.userService.getUser(userId))?.content.language
      await this.sendNotification(userId, message, {
        language: language ?? undefined,
      })
    }
  }

  async completeMessages(
    userId: string,
    type: UserMessageType,
    filter?: (message: UserMessage) => boolean,
  ) {
    await this.databaseService.runTransaction(
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
    await this.databaseService.runTransaction(
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

  // Helpers - Messages

  /// returns whether to save the new message or throw it away
  private handleOldMessages(
    oldMessages: Array<QueryDocumentSnapshot<UserMessage>>,
    newMessage: UserMessage,
    transaction: FirebaseFirestore.Transaction,
  ): boolean {
    switch (newMessage.type) {
      case UserMessageType.weightGain:
        // Keep message from the last week, replace if older
        let containsNewishMessage = false
        for (const oldMessage of oldMessages) {
          const isOld =
            oldMessage.data().creationDate < advanceDateByDays(new Date(), -7)
          if (isOld) {
            transaction.set(
              oldMessage.ref,
              new UserMessage({
                ...oldMessage.data(),
                completionDate: new Date(),
              }),
            )
          } else {
            containsNewishMessage = true
          }
        }
        return !containsNewishMessage
      case UserMessageType.welcome:
      case UserMessageType.medicationUptitration:
        // Keep only the most recent message
        return false
      case UserMessageType.symptomQuestionnaire:
      case UserMessageType.vitals:
        // Mark old messages as completed and create new ones instead
        for (const oldMessage of oldMessages) {
          transaction.set(
            oldMessage.ref,
            new UserMessage({
              ...oldMessage.data(),
              completionDate: new Date(),
            }),
          )
        }
        return true
      case UserMessageType.medicationChange:
      case UserMessageType.preAppointment:
        // Keep old message, if it references the same entity
        for (const oldMessage of oldMessages) {
          if (oldMessage.data().reference === newMessage.reference) {
            return false
          }
        }
        return true
    }
  }

  // Helpers - Notifications

  private async sendNotification(
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
