//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { Lazy, User, type UserType } from '@stanfordbdhg/engagehf-models'
import admin from 'firebase-admin'
import {
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore'
import { type CloudFunction, type Change, logger } from 'firebase-functions'
import { type FirestoreEvent } from 'firebase-functions/firestore'
import {
  type CallableFunction,
  type CallableRequest,
} from 'firebase-functions/v2/https'
import firebaseFunctionsTest from 'firebase-functions-test'
import { type DeepPartial } from 'firebase-functions-test/lib/cloudevent/types.js'
import { CollectionsService } from '../../services/database/collections.js'
import { getServiceFactory } from '../../services/factory/getServiceFactory.js'
import { type ServiceFactory } from '../../services/factory/serviceFactory.js'
import { TestFlags } from '../testFlags.js'

export function describeWithEmulators(
  title: string,
  perform: (env: EmulatorTestEnvironment) => void,
) {
  describe(title, () => {
    if (!TestFlags.connectsToEmulator) {
      it('skipped due to missing emulator', () => {
        logger.warn('skipping test because emulator is not running')
      })
      return
    }

    const env = EmulatorTestEnvironment.instance

    beforeEach(async () => {
      await env.cleanup()
    }, 30_000)

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
  readonly messaging = admin.messaging()
  readonly storage = admin.storage()

  readonly collections = new CollectionsService(this.firestore)
  readonly factory: ServiceFactory

  private readonly wrapper = firebaseFunctionsTest()

  // Constructor

  private constructor() {
    this.factory = getServiceFactory()
  }

  // Methods

  async call<Input, Output>(
    func: CallableFunction<Input, Output>,
    input: Input,
    auth: { uid?: string; token?: object },
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

  async deleteWithTrigger<Model, Params>(
    func: CloudFunction<FirestoreEvent<Change<DocumentSnapshot>, Params>>,
    input: {
      ref: DocumentReference<Model>
      params: Params
    } & DeepPartial<FirestoreEvent<Change<DocumentSnapshot>, Params>>,
  ) {
    const wrapped = this.wrapper.wrap(func)
    const before = await input.ref.withConverter(null).get()
    await input.ref.delete()
    const after = await input.ref.withConverter(null).get()
    await wrapped({
      ...input,
      data: this.wrapper.makeChange(before, after),
    })
  }

  async setWithTrigger<Model, Params>(
    func: CloudFunction<FirestoreEvent<Change<DocumentSnapshot>, Params>>,
    input: {
      ref: DocumentReference<Model>
      data: Model
      params: Params
    } & DeepPartial<FirestoreEvent<Change<DocumentSnapshot>, Params>>,
  ) {
    const wrapped = this.wrapper.wrap(func)
    const before = await input.ref.withConverter(null).get()
    await input.ref.set(input.data)
    const after = await input.ref.withConverter(null).get()
    await wrapped({
      ...input,
      data: this.wrapper.makeChange(before, after),
    })
  }

  async trigger<Model, Params>(
    func: CloudFunction<FirestoreEvent<Change<DocumentSnapshot>, Params>>,
    input: {
      before?: DocumentData
      after?: DocumentData
      ref: DocumentReference<Model>
      params: Params
    } & DeepPartial<FirestoreEvent<Change<DocumentSnapshot>, Params>>,
  ) {
    const wrapped = this.wrapper.wrap(func)
    await wrapped({
      ...input,
      data: this.createChange(input.ref.path, input.before, input.after),
    })
  }

  async cleanup() {
    const collections = await this.firestore.listCollections()
    for (const collection of collections) {
      await this.firestore.recursiveDelete(collection)
    }
    const usersResult = await this.auth.listUsers()
    for (const user of usersResult.users) {
      await this.auth.deleteUser(user.uid)
    }
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  createChange<T extends Record<string, any>>(
    path: string,
    before: T | undefined,
    after: T | undefined,
  ): Change<DocumentSnapshot> {
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
    const beforeSnapshot: DocumentSnapshot<T> =
      before !== undefined ?
        this.wrapper.firestore.makeDocumentSnapshot(before, path)
      : this.createEmptyDocumentSnapshot(path)
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
    const afterSnapshot: DocumentSnapshot<T> =
      after !== undefined ?
        this.wrapper.firestore.makeDocumentSnapshot(after, path)
      : this.createEmptyDocumentSnapshot(path)
    return this.wrapper.makeChange(beforeSnapshot, afterSnapshot)
  }

  async createUser(
    options: {
      type: UserType
      disabled?: boolean
      selfManaged?: boolean
      organization?: string
      clinician?: string
      dateOfEnrollment?: Date
      lastActiveDate?: Date
      invitationCode?: string
      phoneNumbers?: string[]
      receivesAppointmentReminders?: boolean
      receivesInactivityReminders?: boolean
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
        selfManaged: options.selfManaged ?? false,
        disabled: options.disabled ?? false,
        organization: options.organization,
        dateOfEnrollment: options.dateOfEnrollment ?? new Date(),
        clinician: options.clinician,
        lastActiveDate: options.lastActiveDate ?? new Date(),
        invitationCode: options.invitationCode ?? 'TESTCODE',
        receivesAppointmentReminders:
          options.receivesAppointmentReminders ?? true,
        receivesInactivityReminders:
          options.receivesInactivityReminders ?? true,
        receivesMedicationUpdates: options.receivesMedicationUpdates ?? true,
        receivesQuestionnaireReminders:
          options.receivesQuestionnaireReminders ?? true,
        receivesRecommendationUpdates:
          options.receivesRecommendationUpdates ?? true,
        receivesVitalsReminders: options.receivesVitalsReminders ?? true,
        receivesWeightAlerts: options.receivesWeightAlerts ?? true,
        phoneNumbers: options.phoneNumbers ?? [],
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
      get() {
        return undefined
      },
      isEqual() {
        return false
      },
      data: () => undefined,
    }
  }
}
