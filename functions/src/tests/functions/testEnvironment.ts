//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import http from 'http'
import { Lazy, User, type UserType } from '@stanfordbdhg/engagehf-models'
import admin from 'firebase-admin'
import {
  type CallableFunction,
  type CallableRequest,
} from 'firebase-functions/v2/https'
import firebaseFunctionsTest from 'firebase-functions-test'
import { CollectionsService } from '../../services/database/collections.js'
import { getServiceFactory } from '../../services/factory/getServiceFactory.js'
import { type ServiceFactory } from '../../services/factory/serviceFactory.js'
import { type UserClaims } from '../../services/user/databaseUserService.js'
import { Change } from 'firebase-functions'
import { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore'

export function describeWithEmulators(
  title: string,
  perform: (env: EmulatorTestEnvironment) => void,
) {
  describe(title, () => {
    const env = EmulatorTestEnvironment.instance

    beforeEach(async () => {
      await env.cleanup()
    })

    perform(env)
  })
}

export class EmulatorTestEnvironment {
  // Static Properties

  private static lazyInstance = new Lazy<EmulatorTestEnvironment>(() => {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
    admin.initializeApp()
    return new EmulatorTestEnvironment()
  })

  static get instance() {
    return this.lazyInstance.value
  }

  // Stored Properties

  readonly auth = admin.auth()
  readonly firestore = admin.firestore()
  readonly storage = admin.storage()

  readonly collections = new CollectionsService(this.firestore)
  readonly factory: ServiceFactory

  private readonly wrapper = firebaseFunctionsTest()

  private areTriggersEnabled = true

  // Constructor

  private constructor() {
    this.factory = getServiceFactory()
  }

  // Methods

  async call<Input, Output>(
    func: CallableFunction<Input, Output>,
    input: Input,
    auth: { uid: string; token?: Partial<UserClaims> },
  ): Promise<Output> {
    const wrapped = this.wrapper.wrap(func)
    return wrapped({
      data: input,
      auth: {
        uid: auth.uid,
        token: {
          ...(auth.token ?? {}),
        },
      },
    } as unknown as CallableRequest<Input>)
  }

  async cleanup() {
    const collections = await admin.firestore().listCollections()
    for (const collection of collections) {
      await admin.firestore().recursiveDelete(collection)
    }
    const usersResult = await admin.auth().listUsers()
    for (const user of usersResult.users) {
      await admin.auth().deleteUser(user.uid)
    }
  }

  createChange(
    path: string,
    before: Record<string, any> | undefined,
    after: Record<string, any> | undefined,
  ): Change<DocumentSnapshot> {
    const beforeSnapshot =
      before !== undefined ?
        this.wrapper.firestore.makeDocumentSnapshot(before, path)
      : this.createEmptyDocumentSnapshot(path)
    const afterSnapshot =
      after !== undefined ?
        this.wrapper.firestore.makeDocumentSnapshot(after, path)
      : this.createEmptyDocumentSnapshot(path)
    return this.wrapper.makeChange(beforeSnapshot, afterSnapshot)
  }

  async createUser(
    options: {
      type: UserType
      organization?: string
      dateOfEnrollment?: Date
      invitationCode?: string
      receivesAppointmentReminders?: boolean
      receivesMedicationUpdates?: boolean
      receivesQuestionnaireReminders?: boolean
      receivesRecommendationUpdates?: boolean
      receivesVitalsReminders?: boolean
      receivesWeightAlerts?: boolean
    } & admin.auth.CreateRequest,
  ) {
    const authUser = await this.auth.createUser(options)
    await this.collections.users.doc(authUser.uid).set(
      new User({
        type: options.type,
        organization: options.organization,
        dateOfEnrollment: options.dateOfEnrollment ?? new Date(),
        invitationCode: options.invitationCode ?? 'TESTCODE',
        receivesAppointmentReminders:
          options.receivesAppointmentReminders ?? true,
        receivesMedicationUpdates: options.receivesMedicationUpdates ?? true,
        receivesQuestionnaireReminders:
          options.receivesQuestionnaireReminders ?? true,
        receivesRecommendationUpdates:
          options.receivesRecommendationUpdates ?? true,
        receivesVitalsReminders: options.receivesVitalsReminders ?? true,
        receivesWeightAlerts: options.receivesWeightAlerts ?? true,
      }),
    )
    return authUser.uid
  }

  // Helpers

  private createEmptyDocumentSnapshot(path: string): DocumentSnapshot {
    return {
      exists: false,
      id: path.split('/').at(-1) ?? path,
      ref: this.firestore.doc(path),
      readTime: Timestamp.now(),
      get(fieldPath) {
        return undefined
      },
      isEqual(other) {
        return false
      },
      data: () => undefined,
    }
  }

  private async post(url: string, data: object) {
    return new Promise((resolve, reject) => {
      const request = http.request(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        (response) => {
          if (response.statusCode === undefined) {
            reject(new Error('statusCode=undefined'))
            return
          } else if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`statusCode=${response.statusCode}`))
            return
          }
          response.on('end', resolve)
        },
      )
      request.on('error', reject)
      request.write(JSON.stringify(data))
      request.end()
    })
  }
}
