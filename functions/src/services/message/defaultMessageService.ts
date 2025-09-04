//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  advanceDateByDays,
  compact,
  dateTimeConverter,
  type User,
  type UserDevice,
  type UserDevicePlatform,
  type UserMessage,
  userMessageConverter,
  UserMessageType,
} from "@stanfordbdhg/engagehf-models";
import {
  FieldValue,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { type Messaging, type TokenMessage } from "firebase-admin/messaging";
import { https, logger } from "firebase-functions";
import { type MessageService } from "./messageService.js";
import {
  type Document,
  type DatabaseService,
} from "../database/databaseService.js";
import { type UserService } from "../user/userService.js";
import { type PhoneService } from "./phone/phoneService.js";

export class DefaultMessageService implements MessageService {
  // Properties

  private readonly databaseService: DatabaseService;
  private readonly messaging: Messaging;
  private readonly phoneService?: PhoneService;
  private readonly userService: UserService;

  // Constructor

  constructor(
    messaging: Messaging,
    databaseService: DatabaseService,
    phoneService: PhoneService | null,
    userService: UserService,
  ) {
    this.databaseService = databaseService;
    this.messaging = messaging;
    this.phoneService = phoneService ?? undefined;
    this.userService = userService;
  }

  // Methods - Devices

  async registerDevice(userId: string, newDevice: UserDevice): Promise<void> {
    logger.debug(
      `DefaultMessageService.registerDevice(user: ${userId}, ${newDevice.platform}, ${newDevice.notificationToken}): Start`,
    );
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        const devices = await transaction.get(
          collections.devices.where(
            "notificationToken",
            "==",
            newDevice.notificationToken,
          ),
        );
        logger.debug(
          `DefaultMessageService.registerDevice(user: ${userId}, ${newDevice.platform}, ${newDevice.notificationToken}): Found ${devices.size} devices with this token`,
        );
        const userPath = collections.users.doc(userId).path;
        let didFindExistingDevice = false;
        for (const device of devices.docs) {
          if (device.data().platform !== newDevice.platform) continue;
          if (!didFindExistingDevice && device.ref.path.startsWith(userPath)) {
            logger.debug(
              `DefaultMessageService.registerDevice(user: ${userId}, ${newDevice.platform}, ${newDevice.notificationToken}): Found perfect match at ${device.ref.path}, updating`,
            );
            transaction.set(device.ref, newDevice);
            didFindExistingDevice = true;
          } else {
            logger.debug(
              `DefaultMessageService.registerDevice(user: ${userId}, ${newDevice.platform}, ${newDevice.notificationToken}): Deleting device at ${device.ref.path}`,
            );
            transaction.delete(device.ref);
          }
        }

        if (!didFindExistingDevice) {
          const newDeviceRef = collections.userDevices(userId).doc();
          logger.debug(
            `DefaultMessageService.registerDevice(user: ${userId}, ${newDevice.platform}, ${newDevice.notificationToken}): Creating new device at ${newDeviceRef.path}`,
          );
          transaction.set(newDeviceRef, newDevice);
        }
      },
    );
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
            "notificationToken",
            "==",
            notificationToken,
          ),
        );
        logger.debug(
          `DefaultMessageService.unregisterDevice(${platform}, ${notificationToken}): Found ${devices.size} devices with this token`,
        );
        for (const device of devices.docs) {
          if (device.data().platform !== platform) continue;
          logger.debug(
            `DefaultMessageService.unregisterDevice(${platform}, ${notificationToken}): Found device at ${device.ref.path}, deleting`,
          );
          transaction.delete(device.ref);
        }
      },
    );
    return;
  }

  // Methods - Phone Numbers

  async startPhoneNumberVerification(
    userId: string,
    phoneNumber: string,
  ): Promise<void> {
    if (!this.phoneService) {
      logger.error(
        `DefaultMessageService.startPhoneNumberVerification(userId: ${userId}, phoneNumber: ${phoneNumber}): Phone verification is not implemented.`,
      );
      throw new https.HttpsError(
        "unimplemented",
        "Phone verification is not implemented.",
      );
    }

    const user = await this.userService.getUser(userId);
    await this.phoneService.startVerification(phoneNumber, {
      locale: user?.content.language,
    });
  }

  async checkPhoneNumberVerification(
    userId: string,
    phoneNumber: string,
    code: string,
  ): Promise<void> {
    if (!this.phoneService) {
      logger.error(
        `DefaultMessageService.checkPhoneNumberVerification(userId: ${userId}, phoneNumber: ${phoneNumber}): Phone verification is not implemented.`,
      );
      throw new https.HttpsError(
        "unimplemented",
        "Phone verification is not implemented.",
      );
    }

    await this.phoneService.checkVerification(phoneNumber, code);

    await this.databaseService.runTransaction((collections, transaction) => {
      const userRef = collections.users.doc(userId);
      transaction.update(userRef, {
        phoneNumbers: FieldValue.arrayUnion(phoneNumber),
      });
    });
  }

  async deletePhoneNumber(userId: string, phoneNumber: string): Promise<void> {
    await this.databaseService.runTransaction((collections, transaction) => {
      const userRef = collections.users.doc(userId);
      transaction.update(userRef, {
        phoneNumbers: FieldValue.arrayRemove(phoneNumber),
      });
    });
  }

  // Methods - Messages

  async addMessageForClinicianAndOwners(
    userId: string,
    message: UserMessage,
    options: {
      notify: boolean;
      user: User | null;
    },
  ): Promise<void> {
    const user =
      options.user ?? (await this.userService.getUser(userId))?.content;
    if (user === undefined) {
      logger.warn(
        `DefaultMessageService.addMessageForClinicianAndOwners(${userId}): User not found, skipping message forwarding.`,
      );
      return;
    }
    const owners =
      user.organization !== undefined ?
        await this.userService.getAllOwners(user.organization)
      : [];
    const clinican = user.clinician;

    const recipientIds = owners.map((owner) => owner.id);
    if (clinican !== undefined) recipientIds.push(clinican);

    logger.debug(
      `DefaultMessageService.addMessageForClinicianAndOwners(${userId}): Found ${recipientIds.length} recipients (${recipientIds.join(", ")}).`,
    );

    await Promise.all(
      recipientIds.map(async (recipientId) =>
        this.addMessage(recipientId, message, {
          notify: true,
          user: null,
        }),
      ),
    );
  }

  async addMessage(
    userId: string,
    message: UserMessage,
    options: {
      notify: boolean;
      user: User | null;
    },
  ): Promise<Document<UserMessage> | undefined> {
    const user =
      options.user ?? (await this.userService.getUser(userId))?.content;
    if (user === undefined) {
      logger.warn(
        `DefaultMessageService.addMessage(user: ${userId}): User not found, skipping message creation.`,
      );
      return undefined;
    }

    if (user.disabled) {
      logger.info(
        `DefaultMessageService.addMessage(user: ${userId}): User is disabled, skipping message creation.`,
      );
      return undefined;
    }

    const newMessage = await this.databaseService.runTransaction(
      async (collections, transaction) => {
        logger.debug(
          `DatabaseMessageService.addMessage(user: ${userId}): Type = ${message.type}, Reference = ${message.reference}`,
        );
        const existingMessages = (
          await collections
            .userMessages(userId)
            .where("completionDate", "==", null)
            .get()
        ).docs.filter((doc) => {
          const docData = doc.data();
          return (
            docData.type === message.type &&
            docData.reference === message.reference
          );
        });

        logger.debug(
          `DatabaseMessageService.addMessage(user: ${userId}): Found ${existingMessages.length} existing messages`,
        );

        if (
          existingMessages.length === 0 ||
          this.handleOldMessages(existingMessages, message, transaction)
        ) {
          const newMessageRef = collections.userMessages(userId).doc();
          logger.debug(
            `DatabaseMessageService.addMessage(user: ${userId}): Adding new message at ${newMessageRef.path}`,
          );
          transaction.set(newMessageRef, message);
          const document: Document<UserMessage> = {
            id: newMessageRef.id,
            lastUpdate: new Date(),
            path: newMessageRef.path,
            content: message,
          };
          return document;
        }

        return undefined;
      },
    );

    if (newMessage !== undefined && options.notify) {
      logger.debug(
        `DatabaseMessageService.addMessage(user: ${userId}): System will notify user unless user settings prevent it`,
      );

      await this.sendNotificationIfNeeded({
        userId,
        user,
        message: newMessage,
      });
    }

    return newMessage;
  }

  async completeMessages(
    userId: string,
    type: UserMessageType,
    filter?: (message: UserMessage) => boolean,
  ): Promise<string[]> {
    return this.databaseService.runTransaction(
      async (collections, transaction) => {
        const messages = (
          await transaction.get(
            collections
              .userMessages(userId)
              .where("completionDate", "==", null),
          )
        ).docs.filter((doc) => {
          const docData = doc.data();
          return docData.type === type && (filter?.(docData) ?? true);
        });
        logger.debug(
          `DefaultMessageService.completeMessages(user: ${userId}, type: ${type}): Completing ${messages.length} messages (${messages.map((message) => message.ref.path).join(", ")})`,
        );
        for (const message of messages) {
          this.updateCompletionDate(message.ref, transaction);
        }
        return messages.map((message) => message.id);
      },
    );
  }

  async completeMessagesIncludingClinicianAndOwners(
    userId: string,
    type: UserMessageType,
    options: {
      user?: User;
    },
  ) {
    const user =
      options.user ?? (await this.userService.getUser(userId))?.content;

    if (user === undefined) {
      logger.warn(
        `DefaultMessageService.completeMessagesIncludingClinicianAndOwners(${userId}): User not found, skipping message completion.`,
      );
      return;
    }
    const owners =
      user.organization !== undefined ?
        await this.userService.getAllOwners(user.organization)
      : [];
    const clinican = user.clinician;

    const messageIds = await this.completeMessages(userId, type);

    const recipientIds = owners.map((owner) => owner.id);
    if (clinican !== undefined) recipientIds.push(clinican);

    logger.debug(
      `DefaultMessageService.completeMessagesIncludingClinicianAndOwners(${userId}): Found ${recipientIds.length} previous recipients (${recipientIds.join(", ")}).`,
    );

    await Promise.all(
      recipientIds.map(async (recipientId) =>
        this.completeMessages(recipientId, type, (message) =>
          message.reference !== undefined ?
            messageIds.includes(message.reference)
          : false,
        ),
      ),
    );
  }

  async dismissMessage(
    userId: string,
    messageId: string,
    didPerformAction: boolean,
  ): Promise<void> {
    logger.info(
      `dismissMessage for user/${userId}/message/${messageId} with didPerformAction ${didPerformAction}`,
    );
    await this.databaseService.runTransaction(
      async (collections, transaction) => {
        const messageRef = collections.userMessages(userId).doc(messageId);
        const message = await transaction.get(messageRef);
        const messageContent = message.data();
        if (!message.exists || !messageContent)
          throw new https.HttpsError("not-found", "Message not found.");

        if (!messageContent.isDismissible)
          throw new https.HttpsError(
            "invalid-argument",
            "Message is not dismissible.",
          );

        this.updateCompletionDate(messageRef, transaction);
      },
    );
  }

  async dismissMessages(
    userId: string,
    options: {
      messageIds?: string[];
      didPerformAction: boolean;
    },
  ): Promise<number> {
    logger.info(
      `dismissMessages for user/${userId} with options: ${JSON.stringify(options)}`,
    );

    return this.databaseService.runTransaction(
      async (collections, transaction) => {
        // If specific message IDs were provided
        if (options.messageIds && options.messageIds.length > 0) {
          logger.debug(
            `dismissMessages: Processing ${options.messageIds.length} specific messages for user/${userId}`,
          );

          // Get all messages in a batch
          const messageRefs = options.messageIds.map((messageId) =>
            collections.userMessages(userId).doc(messageId),
          );

          const messageSnapshots = await Promise.all(
            messageRefs.map((ref) => transaction.get(ref)),
          );

          let dismissedCount = 0;

          // Then process and write updates after all reads are complete
          messageSnapshots.forEach((message, index) => {
            const messageContent = message.data();

            if (message.exists && messageContent?.isDismissible) {
              this.updateCompletionDate(messageRefs[index], transaction);
              dismissedCount++;
            }
          });

          return dismissedCount;
        }

        // If no messageIds were provided, dismiss all dismissible messages
        logger.debug(
          `dismissMessages: Dismissing all dismissible messages for user/${userId}`,
        );

        const messagesSnapshot = await transaction.get(
          collections.userMessages(userId).where("completionDate", "==", null),
        );

        // Filter in memory to get only dismissible messages
        const messages = messagesSnapshot.docs.filter(
          (doc) => doc.data().isDismissible,
        );

        logger.debug(
          `dismissMessages: Found ${messages.length} dismissible messages for user/${userId}`,
        );

        messages.forEach((message) =>
          this.updateCompletionDate(message.ref, transaction),
        );

        return messages.length;
      },
    );
  }

  // Helpers - Messages

  /// returns whether to save the new message or throw it away
  private handleOldMessages(
    oldMessages: Array<QueryDocumentSnapshot<UserMessage>>,
    newMessage: UserMessage,
    transaction: FirebaseFirestore.Transaction,
  ): boolean {
    switch (newMessage.type) {
      case UserMessageType.medicationUptitration:
      case UserMessageType.weightGain:
        // Keep message from the last week, replace if older
        let containsNewishMessage = false;
        for (const oldMessage of oldMessages) {
          const isOld =
            oldMessage.data().creationDate < advanceDateByDays(new Date(), -7);
          if (isOld) {
            logger.debug(
              `DefaultMessageService.handleOldMessages(weightGain): Completing old message ${oldMessage.ref.path}`,
            );
            this.updateCompletionDate(oldMessage.ref, transaction);
          } else {
            logger.debug(
              `DefaultMessageService.handleOldMessages(${newMessage.type}): Contains newish message at: ${oldMessage.ref.path}`,
            );
            containsNewishMessage = true;
          }
        }
        logger.debug(
          `DefaultMessageService.handleOldMessages(${newMessage.type}): Contains newish message? ${containsNewishMessage ? "yes" : "no"}`,
        );
        return !containsNewishMessage;
      case UserMessageType.kccqDecline:
      case UserMessageType.postAppointmentQuestionnaire:
      case UserMessageType.registrationQuestionnaire:
      case UserMessageType.symptomQuestionnaire:
      case UserMessageType.vitals:
        // Mark old messages as completed and create new ones instead
        for (const oldMessage of oldMessages) {
          logger.debug(
            `DefaultMessageService.handleOldMessages(${newMessage.type}): Completing message ${oldMessage.ref.path}`,
          );
          this.updateCompletionDate(oldMessage.ref, transaction);
        }
        return true;
      case UserMessageType.welcome:
      case UserMessageType.medicationChange:
      case UserMessageType.preAppointment:
      case UserMessageType.inactive:
        logger.debug(
          `DefaultMessageService.handleOldMessages(${newMessage.type}): Only creating new message, if there are no old messages with the same reference (count: ${oldMessages.length})`,
        );
        return oldMessages.length === 0;
    }
  }

  private updateCompletionDate(
    ref: FirebaseFirestore.DocumentReference<UserMessage>,
    transaction: FirebaseFirestore.Transaction,
  ) {
    transaction.update(ref, {
      completionDate: dateTimeConverter.encode(new Date()),
    });
  }

  // Helpers - Notifications

  private async sendNotificationIfNeeded(input: {
    userId: string;
    user: User;
    message: Document<UserMessage>;
  }) {
    switch (input.message.content.type) {
      case UserMessageType.medicationChange:
        if (!input.user.receivesMedicationUpdates) return;
        break;
      case UserMessageType.weightGain:
        if (!input.user.receivesWeightAlerts) return;
        break;
      case UserMessageType.medicationUptitration:
        if (!input.user.receivesRecommendationUpdates) return;
        break;
      case UserMessageType.welcome:
        break;
      case UserMessageType.vitals:
        if (!input.user.receivesVitalsReminders) return;
        break;
      case UserMessageType.symptomQuestionnaire:
        if (!input.user.receivesQuestionnaireReminders) return;
        break;
      case UserMessageType.preAppointment:
        if (!input.user.receivesAppointmentReminders) return;
        break;
    }

    await Promise.all([
      this.sendTextNotification(input.userId, input.user, input.message),
      this.sendPushNotification(input.userId, input.message, {
        language: input.user.language,
      }),
    ]);
  }

  private async sendTextNotification(
    userId: string,
    user: User,
    message: Document<UserMessage>,
  ): Promise<void> {
    if (!this.phoneService) {
      logger.warn(
        `DefaultMessageService.sendTextNotification(userId: ${userId}): Phone service is not implemented.`,
      );
      return;
    }

    const languages = compact([user.language]);
    for (const phoneNumber of user.phoneNumbers) {
      const title = message.content.title.localize(...languages);
      const description =
        message.content.description?.localize(...languages) ?? "";
      try {
        await this.phoneService.sendTextMessage(
          phoneNumber,
          [title, description].filter((text) => text.length > 0).join(": "),
        );
      } catch (error: unknown) {
        logger.error(
          `DefaultMessageService.sendTextNotification(userId: ${userId}): Failed to send message to ${phoneNumber}: ${String(error)}`,
        );
        continue;
      }
    }
  }

  private async sendPushNotification(
    userId: string,
    message: Document<UserMessage>,
    options: {
      language?: string;
    },
  ): Promise<void> {
    logger.debug(
      `DatabaseMessageService.sendNotification(user: ${userId}): Start`,
    );

    const devices = await this.databaseService.getQuery<UserDevice>(
      (collections) => collections.userDevices(userId),
    );

    logger.debug(
      `DatabaseMessageService.sendNotification(user: ${userId}): Found ${devices.length} devices`,
    );

    if (devices.length === 0) return;

    const notifications: TokenMessage[] = devices.map((device) =>
      this.tokenMessage(message, {
        device: device.content,
        languages: compact([device.content.language, options.language]),
      }),
    );

    logger.debug(
      `DatabaseMessageService.sendNotification(user: ${userId}): Sending out ${notifications.length} notifications`,
    );

    const batchResponse = await this.messaging.sendEach(notifications);

    await Promise.all(
      batchResponse.responses.map(async (individualResponse, index) => {
        if (!individualResponse.success) {
          logger.error(
            `DatabaseMessageService.sendNotification(user: ${userId}): Tried sending message to ${devices[index].content.notificationToken} but failed: ${JSON.stringify(individualResponse.error)}`,
          );
        }
        if (
          individualResponse.error?.code !==
          "messaging/registration-token-not-registered"
        )
          return;

        logger.debug(
          `DatabaseMessageService.sendNotification(user: ${userId}): Deleting token ${devices[index].content.notificationToken}`,
        );

        await this.databaseService.runTransaction(
          (collections, transaction) => {
            transaction.delete(
              collections.userDevices(userId).doc(devices[index].id),
            );
          },
        );
      }),
    );
  }

  private tokenMessage(
    message: Document<UserMessage>,
    options: {
      device: UserDevice;
      languages: string[];
    },
  ): TokenMessage {
    const data: Record<string, string> = {};
    if (message.content.action !== undefined)
      data.action = message.content.action;
    data.type = message.content.type;
    data.messageId = message.id;
    data.isDismissible = message.content.isDismissible ? "true" : "false";

    const title = message.content.title.localize(...options.languages);
    const body = message.content.description?.localize(...options.languages);
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
    };
  }
}
