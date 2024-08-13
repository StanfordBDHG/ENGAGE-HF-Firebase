//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { FieldValue } from 'firebase-admin/firestore'
import { type Messaging, type TokenMessage } from 'firebase-admin/messaging'
import { https } from 'firebase-functions'
import { type MessageService } from './messageService.js'
import { advanceDateByDays } from '../../extensions/date.js'
import { localize } from '../../extensions/localizedText.js'
import { type UserDevice } from '../../models/device.js'
import { UserMessageType, type UserMessage } from '../../models/message.js'
import { type DatabaseService } from '../database/databaseService.js'

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
      async (firestore, transaction) => {
        const devices = await transaction.get(
          firestore.collection(`users/${userId}/devices`),
        )
        const existingDevice = devices.docs.find(
          (doc) => doc.data().notificationToken === device.notificationToken,
        )
        if (existingDevice) {
          transaction.update(existingDevice.ref, {
            ...device,
            modifiedDate: FieldValue.serverTimestamp(),
          })
        } else {
          transaction.set(
            firestore.collection(`users/${userId}/devices`).doc(),
            {
              ...device,
              modifiedDate: FieldValue.serverTimestamp(),
            },
          )
        }
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
    const devices = await this.databaseService.getCollection<UserDevice>(
      `users/${userId}/devices`,
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

        const deviceId = devices[index].id
        await this.databaseService.runTransaction((firestore, transaction) => {
          transaction.delete(
            firestore.doc(`users/${userId}/devices/${deviceId}`),
          )
        })
      }),
    )

    return
  }

  // Methods - Messages

  async addMessage(userId: string, message: UserMessage): Promise<boolean> {
    return this.databaseService.runTransaction(
      async (firestore, transaction) => {
        const existingMessage = (
          await firestore
            .collection(`users/${userId}/messages`)
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
          const newMessageRef = firestore
            .collection(`users/${userId}/messages`)
            .doc()
          transaction.set(newMessageRef, message)
          return true
        }

        return false
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
      async (firestore, transaction) => {
        const messageRef = firestore.doc(
          `users/${userId}/messages/${messageId}`,
        )
        const message = await transaction.get(messageRef)
        if (!message.exists)
          throw new https.HttpsError('not-found', 'Message not found.')

        const messageContent = message.data() as UserMessage
        if (!messageContent.isDismissible)
          throw new https.HttpsError(
            'invalid-argument',
            'Message is not dismissible.',
          )

        transaction.update(messageRef, {
          completionDate: FieldValue.serverTimestamp(),
        })
      },
    )
  }

  // Helpers

  /// returns whether to save the new message or throw it away
  private handleOldMessage(
    oldMessage: FirebaseFirestore.QueryDocumentSnapshot,
    newMessage: UserMessage,
    transaction: FirebaseFirestore.Transaction,
  ): boolean {
    switch (newMessage.type) {
      case UserMessageType.weightGain: {
        const isOld =
          new Date(oldMessage.data().creationDate as string) >=
          advanceDateByDays(new Date(), -7)
        if (isOld) {
          transaction.update(oldMessage.ref, {
            completionDate: FieldValue.serverTimestamp(),
          })
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
        transaction.update(oldMessage.ref, {
          completionDate: FieldValue.serverTimestamp(),
        })
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
        title: localize(message.title, ...options.languages),
        body:
          message.description ?
            localize(message.description, ...options.languages)
          : undefined,
      },
      data: data,
      fcmOptions: {
        analyticsLabel: message.type,
      },
    }
  }
}
