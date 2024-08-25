//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import http from 'http'
import admin from 'firebase-admin'
import { Lazy } from '@stanfordbdhg/engagehf-models'
import { ServiceFactory } from '../../services/factory/serviceFactory.js'
import { getServiceFactory } from '../../services/factory/getServiceFactory.js'
import firebaseFunctionsTest from 'firebase-functions-test'
import { UserClaims } from '../../services/user/databaseUserService.js'
import { CallableFunction, CallableRequest } from 'firebase-functions/v2/https'
import { CollectionsService } from '../../services/database/collections.js'

export interface EmulatorTestEnvironmentOptions {
  triggersEnabled: boolean
}

export function describeWithEmulators(
  title: string,
  options: EmulatorTestEnvironmentOptions,
  perform: (env: EmulatorTestEnvironment) => Promise<void> | void,
) {
  describe(title, async () => {
    const env = EmulatorTestEnvironment.instance

    beforeEach(async () => {
      await env.cleanup(options)
    })

    await perform(env)
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

  private areTriggersEnabled?: boolean

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
    return await wrapped({
      data: input,
      auth: {
        uid: auth.uid,
        token: {
          ...(auth.token ?? {}),
        },
      },
    } as unknown as CallableRequest<Input>)
  }

  async cleanup(options: EmulatorTestEnvironmentOptions) {
    const collections = await admin.firestore().listCollections()
    for (const collection of collections) {
      await admin.firestore().recursiveDelete(collection)
    }
    const usersResult = await admin.auth().listUsers()
    for (const user of usersResult.users) {
      await admin.auth().deleteUser(user.uid)
    }
    if (this.areTriggersEnabled !== options.triggersEnabled) {
      if (options.triggersEnabled) {
        await this.enableTriggers()
      } else {
        await this.disableTriggers()
      }
    }
  }

  async enableTriggers() {
    try {
      await this.put('http://localhost:4400/functions/enableBackgroundTriggers')
    } catch (error) {
      console.error('Failed to enable triggers:', error)
    }
    this.areTriggersEnabled = true
  }

  async disableTriggers() {
    try {
      await this.put(
        'http://localhost:4400/functions/disableBackgroundTriggers',
      )
    } catch (error) {
      console.error('Failed to disable triggers:', error)
    }
    this.areTriggersEnabled = false
  }

  // Helpers

  private async put(url: string) {
    return new Promise((resolve, reject) => {
      const request = http.request(url, { method: 'PUT' }, (response) => {
        if (response.statusCode === undefined) {
          return reject(new Error('statusCode=undefined'))
        } else if (response.statusCode < 200 || response.statusCode >= 300) {
          return reject(new Error('statusCode=' + response.statusCode))
        }
        response.on('end', resolve)
      })
      request.on('error', reject)
      request.end()
    })
  }
}
