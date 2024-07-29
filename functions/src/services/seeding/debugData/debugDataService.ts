//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type Auth } from 'firebase-admin/auth'
import { UserDebugDataFactory } from './userDebugDataFactory.js'
import { AppointmentStatus } from '../../../models/fhir/appointment.js'
import { type FHIRQuestionnaire } from '../../../models/fhir/questionnaire.js'
import { DrugReference, LoincCode } from '../../codes.js'
import { type DatabaseService } from '../../database/databaseService.js'
import { QuantityUnit } from '../../fhir/quantityUnit.js'
import { CachingStrategy, SeedingService } from '../seedingService.js'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface UserSeedingOptions {
  auth: {
    uid?: string
    email: string
    password: string
  }
  user?: any
  collections?: Record<string, any[]>
}

export interface CustomSeedingOptions {
  users: UserSeedingOptions[]
  firestore: Record<string, any[]>
}

export class DebugDataService extends SeedingService {
  // Properties

  private readonly auth: Auth
  private readonly databaseService: DatabaseService
  private readonly userDataFactory: UserDebugDataFactory

  // Constructor

  constructor(auth: Auth, databaseService: DatabaseService) {
    super({ useIndicesAsKeys: true, path: './data/debug/' })
    this.auth = auth
    this.databaseService = databaseService
    this.userDataFactory = new UserDebugDataFactory()
  }

  // Methods

  async seedCustom(input: CustomSeedingOptions): Promise<string[]> {
    const userIds = await Promise.all(
      input.users.map((user) => this.createUser(user)),
    )

    await this.databaseService.runTransaction((firestore, transaction) => {
      for (const collectionName in input.firestore) {
        const collection = firestore.collection(collectionName)
        for (const data of input.firestore[collectionName]) {
          this.setUnstructuredCollection(collection, data, transaction)
        }
      }
    })

    return userIds
  }

  async seedInvitations() {
    await this.cachingCollection('invitations', 'invitations.json', () => [])
  }

  async seedUsers() {
    const users = this.readJSON<UserSeedingOptions[]>('users.json')
    const userIds = await Promise.all(
      users.map((user) => this.createUser(user)),
    )
    return userIds
  }

  async seedUserAppointments(userId: string) {
    await this.cachingCollection(
      `users/${userId}/appointments`,
      'patients/appointments.json',
      () => [
        this.userDataFactory.appointment({
          userId,
          created: new Date(),
          status: AppointmentStatus.booked,
          start: new Date('2024-09-09'),
          durationInMinutes: 30,
        }),
      ],
    )
  }

  async seedUserMedicationRequests(userId: string) {
    await this.cachingCollection(
      `users/${userId}/medicationRequests`,
      'patients/medicationRequests.json',
      () => [
        this.userDataFactory.medicationRequest({
          repeatTimeOfDay: ['08:00', '20:00'],
          drugReference: DrugReference.eplerenone25,
          quantity: 2,
        }),
      ],
    )
  }

  async seedUserMessages(userId: string) {
    await this.cachingCollection(
      `users/${userId}/messages`,
      'patients/messages.json',
      () => [
        this.userDataFactory.medicationChangeMessage({
          videoReference: 'videoSections/1/videos/2',
        }),
        this.userDataFactory.medicationUptitrationMessage(),
        this.userDataFactory.preAppointmentMessage(),
        this.userDataFactory.symptomQuestionnaireMessage({
          questionnaireReference: 'questionnaires/0',
        }),
        this.userDataFactory.vitalsMessage(),
        this.userDataFactory.weightGainMessage(),
        this.userDataFactory.welcomeMessage({
          videoReference: 'videoSections/0/videos/0',
        }),
      ],
    )
  }

  async seedUserBloodPressureObservations(userId: string) {
    await this.cachingCollection(
      `users/${userId}/bloodPressureObservations`,
      'patients/bloodPressureObservations.json',
      () => [
        this.userDataFactory.bloodPressureObservation({
          date: new Date(),
          systolic: 120,
          diastolic: 80,
        }),
      ],
    )
  }

  async seedUserBodyWeightObservations(userId: string) {
    await this.cachingCollection(
      `users/${userId}/weightObservations`,
      'patients/weightObservations.json',
      () => [
        this.userDataFactory.observation({
          date: new Date(),
          value: 70,
          unit: QuantityUnit.kg,
          code: LoincCode.bodyWeight,
        }),
      ],
    )
  }

  async seedUserCreatinineObservations(userId: string) {
    await this.cachingCollection(
      `users/${userId}/creatinineObservations`,
      'patients/creatinineObservations.json',
      () => [
        this.userDataFactory.observation({
          date: new Date(),
          value: 1.2,
          unit: QuantityUnit.mg_dL,
          code: LoincCode.creatinine,
        }),
      ],
    )
  }

  async seedUserDryWeightObservations(userId: string) {
    await this.cachingCollection(
      `users/${userId}/dryWeightObservations`,
      'patients/dryWeightObservations.json',
      () => [
        this.userDataFactory.observation({
          date: new Date(),
          value: 70,
          unit: QuantityUnit.kg,
          code: LoincCode.bodyWeight,
        }),
      ],
    )
  }

  async seedUserEgfrObservations(userId: string) {
    await this.cachingCollection(
      `users/${userId}/eGfrObservations`,
      'patients/eGfrObservations.json',
      () => [
        this.userDataFactory.observation({
          date: new Date(),
          value: 60,
          unit: QuantityUnit.mL_min_173m2,
          code: LoincCode.estimatedGlomerularFiltrationRate,
        }),
      ],
    )
  }

  async seedUserHeartRateObservations(userId: string) {
    await this.cachingCollection(
      `users/${userId}/heartRateObservations`,
      'patients/heartRateObservations.json',
      () => [
        this.userDataFactory.observation({
          date: new Date(),
          value: 70,
          unit: QuantityUnit.bpm,
          code: LoincCode.heartRate,
        }),
      ],
    )
  }

  async seedUserPotassiumObservations(userId: string) {
    await this.cachingCollection(
      `users/${userId}/potassiumObservations`,
      'patients/potassiumObservations.json',
      () => [
        this.userDataFactory.observation({
          date: new Date(),
          value: 4.2,
          unit: QuantityUnit.mEq_L,
          code: LoincCode.potassium,
        }),
      ],
    )
  }

  async seedUserQuestionnaireResponses(userId: string) {
    await this.cachingCollection(
      `users/${userId}/questionnaireResponses`,
      'patients/questionnaireResponses.json',
      () => {
        const questionnaire = this.readJSON<FHIRQuestionnaire[]>(
          'questionnaires.json',
        ).at(0)
        return {
          '123': this.userDataFactory.questionnaireResponse({
            questionnaire: questionnaire?.id ?? '',
            questionnaireResponse: '123',
            date: new Date(),
            answer1a: 1,
            answer1b: 4,
            answer1c: 3,
            answer2: 2,
            answer3: 3,
            answer4: 4,
            answer5: 5,
            answer6: 3,
            answer7: 4,
            answer8a: 2,
            answer8b: 4,
            answer8c: 4,
            answer9: 3,
          }),
        }
      },
    )
  }

  // Helpers

  private async createUser(user: UserSeedingOptions): Promise<string> {
    const authUser = await this.auth.createUser(user.auth)
    await this.databaseService.runTransaction((firestore, transaction) => {
      transaction.set(firestore.doc(`users/${authUser.uid}`), user.user)
      for (const collectionName in user.collections ?? {}) {
        const collection = firestore.collection(collectionName)
        for (const data of user.collections?.[collectionName] ?? []) {
          this.setUnstructuredCollection(collection, data, transaction)
        }
      }
    })
    return authUser.uid
  }

  private async cachingCollection<T>(
    collectionName: string,
    fileName: string,
    create: () => Promise<T[] | Record<string, T>> | T[] | Record<string, T>,
  ) {
    const values = await this.cache(
      CachingStrategy.updateCacheIfNeeded,
      create,
      () => this.readJSON(fileName),
      (values) => this.writeJSON(fileName, values),
    )
    await this.replaceCollection(collectionName, values)
  }

  private async replaceCollection<T>(
    name: string,
    data: T[] | Record<string, T>,
  ) {
    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        await this.deleteCollection(name, firestore, transaction)
        this.setUnstructuredCollection(
          firestore.collection(name),
          data,
          transaction,
        )
      },
    )
  }
}
