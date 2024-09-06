//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  advanceDateByDays,
  type User,
  type UserDevice,
  type UserDevicePlatform,
  UserMessage,
  userMessageConverter,
  UserMessageType,
} from '@stanfordbdhg/engagehf-models'
import { type QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { type Messaging, type TokenMessage } from 'firebase-admin/messaging'
import { https, logger } from 'firebase-functions'
import { type MessageService } from './messageService.js'
import {
  type Document,
  type DatabaseService,
} from '../database/databaseService.js'
import { type UserService } from '../user/userService.js'
import { compact, compactMap } from '../../extensions/array.js'

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

  async registerDevice(userId: string, newDevice: UserDevice): Promise<void> {
    logger.debug(
      `DefaultMessageService.registerDevice(user: ${userId}, ${newDevice.platform}, ${newDevice.notificationToken}): Start`,
    )
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        const devices = await transaction.get(
          collections.devices.where(
            'notificationToken',
            '==',
            newDevice.notificationToken,
          ),
        )
        logger.debug(
          `DefaultMessageService.registerDevice(user: ${userId}, ${newDevice.platform}, ${newDevice.notificationToken}): Found ${devices.size} devices with this token`,
        )
        const userPath = collections.users.doc(userId).path
        let didFindExistingDevice = false
        for (const device of devices.docs) {
          if (device.data().platform !== newDevice.platform) continue
          if (!didFindExistingDevice && device.ref.path.startsWith(userPath)) {
            logger.debug(
              `DefaultMessageService.registerDevice(user: ${userId}, ${newDevice.platform}, ${newDevice.notificationToken}): Found perfect match at ${device.ref.path}, updating`,
            )
            transaction.set(device.ref, newDevice)
            didFindExistingDevice = true
          } else {
            logger.debug(
              `DefaultMessageService.registerDevice(user: ${userId}, ${newDevice.platform}, ${newDevice.notificationToken}): Deleting device at ${device.ref.path}`,
            )
            transaction.delete(device.ref)
          }
        }

        if (!didFindExistingDevice) {
          const newDeviceRef = collections.userDevices(userId).doc()
          logger.debug(
            `DefaultMessageService.registerDevice(user: ${userId}, ${newDevice.platform}, ${newDevice.notificationToken}): Creating new device at ${newDeviceRef.path}`,
          )
          transaction.set(newDeviceRef, newDevice)
        }
      },
    )
  }

  async unregisterDevice(
    _: string,
    notificationToken: string,
    platform: UserDevicePlatform,
  ): Promise<void> {
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        const devices = await transaction.get(
          collections.devices.where(
            'notificationToken',
            '==',
            notificationToken,
          ),
        )
        logger.debug(
          `DefaultMessageService.unregisterDevice(${platform}, ${notificationToken}): Found ${devices.size} devices with this token`,
        )
        for (const device of devices.docs) {
          if (device.data().platform !== platform) continue
          logger.debug(
            `DefaultMessageService.unregisterDevice(${platform}, ${notificationToken}): Found device at ${device.ref.path}, deleting`,
          )
          transaction.delete(device.ref)
        }
      },
    )
    return
  }

  // Methods - Messages

  async addMessage(
    userId: string,
    message: UserMessage,
    options: {
      notify: boolean
      user?: User | null
    },
  ): Promise<void> {
    const newMessage = await this.databaseService.runTransaction(
      async (collections, transaction) => {
        logger.debug(
          `DatabaseMessageService.addMessage(user: ${userId}): Type = ${message.type}, Reference = ${message.reference}`,
        )
        const existingMessages = (
          await collections
            .userMessages(userId)
            .where('completionDate', '==', null)
            .get()
        ).docs.filter((doc) => doc.data().type === message.type)

        logger.debug(
          `DatabaseMessageService.addMessage(user: ${userId}): Found ${existingMessages.length} existing messages`,
        )

        if (
          existingMessages.length === 0 ||
          this.handleOldMessages(existingMessages, message, transaction)
        ) {
          const newMessageRef = collections.userMessages(userId).doc()
          logger.debug(
            `DatabaseMessageService.addMessage(user: ${userId}): Adding new message at ${newMessageRef.path}`,
          )
          transaction.set(newMessageRef, message)
          const document: Document<UserMessage> = {
            id: newMessageRef.id,
            path: newMessageRef.path,
            content: message,
          }
          return document
        }

        return undefined
      },
    )

    if (newMessage !== undefined && options.notify) {
      logger.debug(
        `DatabaseMessageService.addMessage(user: ${userId}): System will notify user unless user settings prevent it`,
      )

      const user =
        options.user ?? (await this.userService.getUser(userId))?.content
      if (!user) return

      switch (message.type) {
        case UserMessageType.medicationChange:
          if (!user.receivesMedicationUpdates) return
        case UserMessageType.weightGain:
          if (!user.receivesWeightAlerts) return
        case UserMessageType.medicationUptitration:
          if (!user.receivesRecommendationUpdates) return
        case UserMessageType.welcome:
          break
        case UserMessageType.vitals:
          if (!user.receivesVitalsReminders) return
        case UserMessageType.symptomQuestionnaire:
          if (!user.receivesQuestionnaireReminders) return
        case UserMessageType.preAppointment:
          if (!user.receivesAppointmentReminders) return
      }

      await this.sendNotification(userId, newMessage, {
        language: user.language,
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
        const messages = (
          await transaction.get(
            collections
              .userMessages(userId)
              .where('completionDate', '==', null),
          )
        ).docs.filter((doc) => {
          const docData = doc.data()
          return docData.type === type && (filter?.(docData) ?? true)
        })
        logger.debug(
          `DefaultMessageService.completeMessages(user: ${userId}, type: ${type}): Completing ${messages.length} messages (${messages.map((message) => message.ref.path).join(', ')})`,
        )
        for (const message of messages) {
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
    logger.info(
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
    oldMessages: QueryDocumentSnapshot<UserMessage>[],
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
            logger.debug(
              `DefaultMessageService.handleOldMessages(weightGain): Completing old message ${oldMessage.ref.path}`,
            )
            transaction.set(
              oldMessage.ref,
              new UserMessage({
                ...oldMessage.data(),
                completionDate: new Date(),
              }),
            )
          } else {
            logger.debug(
              `DefaultMessageService.handleOldMessages(weightGain): Contains newish message at: ${oldMessage.ref.path}`,
            )
            containsNewishMessage = true
          }
        }
        logger.debug(
          `DefaultMessageService.handleOldMessages(weightGain): Contains newish message? ${containsNewishMessage ? 'yes' : 'no'}`,
        )
        return !containsNewishMessage
      case UserMessageType.welcome:
      case UserMessageType.medicationUptitration:
        logger.debug(
          `DefaultMessageService.handleOldMessages(${newMessage.type}): Only creating new message, if there are no old messages (count: ${oldMessages.length})`,
        )
        // Keep only the most recent message
        return oldMessages.length === 0
      case UserMessageType.symptomQuestionnaire:
      case UserMessageType.vitals:
        // Mark old messages as completed and create new ones instead
        for (const oldMessage of oldMessages) {
          logger.debug(
            `DefaultMessageService.handleOldMessages(${newMessage.type}): Completing message ${oldMessage.ref.path}`,
          )
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
        logger.debug(
          `DefaultMessageService.handleOldMessages(${newMessage.type}): Only creating new message, if there are no old messages with the same reference (count: ${oldMessages.length})`,
        )
        // Keep old message, if it references the same entity
        for (const oldMessage of oldMessages) {
          if (oldMessage.data().reference === newMessage.reference) {
            logger.debug(
              `DefaultMessageService.handleOldMessages(${newMessage.type}): Found message with the same reference at ${oldMessage.ref.path}`,
            )
            return false
          }
        }
        return true
    }
  }

  // Helpers - Notifications

  private async sendNotification(
    userId: string,
    message: Document<UserMessage>,
    options: {
      language?: string
    },
  ): Promise<void> {
    logger.debug(
      `DatabaseMessageService.sendNotification(user: ${userId}): Start`,
    )

    const devices = await this.databaseService.getQuery<UserDevice>(
      (collections) => collections.userDevices(userId),
    )

    logger.debug(
      `DatabaseMessageService.sendNotification(user: ${userId}): Found ${devices.length} devices`,
    )

    if (devices.length === 0) return

    const notifications: TokenMessage[] = devices.map((device) =>
      this.tokenMessage(message, {
        device: device.content,
        languages: compact([device.content.language, options.language]),
      }),
    )

    logger.debug(
      `DatabaseMessageService.sendNotification(user: ${userId}): Sending out ${notifications.length} notifications`,
    )

    const batchResponse = await this.messaging.sendEach(notifications)

    await Promise.all(
      batchResponse.responses.map(async (individualResponse, index) => {
        if (!individualResponse.success) {
          logger.error(
            `DatabaseMessageService.sendNotification(user: ${userId}): Tried sending message to ${devices[index].content.notificationToken} but failed: ${String(individualResponse.error)}`,
          )
        }
        if (
          individualResponse.error?.code !==
          'messaging/registration-token-not-registered'
        )
          return

        logger.error(
          `DatabaseMessageService.sendNotification(user: ${userId}): Deleting token ${devices[index].content.notificationToken}`,
        )

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
    message: Document<UserMessage>,
    options: {
      device: UserDevice
      languages: string[]
    },
  ): TokenMessage {
    const data: Record<string, string> = {}
    if (message.content.action !== undefined)
      data.action = message.content.action
    data.type = message.content.type
    data.messageId = message.id

    const title = message.content.title.localize(...options.languages)
    const body = message.content.description?.localize(...options.languages)
    return {
      token: options.device.notificationToken,
      notification: {
        title: title,
        body: body,
      },
      android: {
        notification: {
          title: title,
          body: body,
        },
        data: data,
      },
      apns: {
        payload: {
          ...userMessageConverter.value.encode(message.content),
          messageId: message.id,
          aps: {
            alert: {
              title: title,
              body: body,
            },
          },
        },
      },
      data: data,
      fcmOptions: {
        analyticsLabel: message.content.type,
      },
    }
  }
}
