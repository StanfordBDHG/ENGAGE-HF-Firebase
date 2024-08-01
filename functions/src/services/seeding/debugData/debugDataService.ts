//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type Auth } from 'firebase-admin/auth'
import { UserDebugDataFactory } from './userDebugDataFactory.js'
import { chunks } from '../../../extensions/array.js'
import { AppointmentStatus } from '../../../models/fhir/appointment.js'
import { type FHIRQuestionnaire } from '../../../models/fhir/questionnaire.js'
import { type Invitation } from '../../../models/invitation.js'
import { DrugReference, LoincCode } from '../../codes.js'
import { type DatabaseService } from '../../database/databaseService.js'
import { QuantityUnit } from '../../fhir/quantityUnit.js'
import { SeedingService } from '../seedingService.js'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface UserSeedingOptions {
  auth: {
    uid?: string
    email: string
    password: string
  }
  user?: any
  collections?: Record<string, Record<string, any>>
}

export interface CustomSeedingOptions {
  users: UserSeedingOptions[]
  firestore: Record<string, Record<string, any>>
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
    const userIds: string[] = []
    for (const user of input.users) {
      try {
        userIds.push(await this.createUser(user))
      } catch (error) {
        console.error(error)
      }
    }
    await this.databaseService.runTransaction((firestore, transaction) => {
      for (const collectionName in input.firestore) {
        this.setUnstructuredCollection(
          firestore.collection(collectionName),
          input.firestore[collectionName],
          transaction,
        )
      }
    })
    return userIds
  }

  async seedInvitations() {
    const invitations =
      this.readJSON<Record<string, Invitation>>('invitations.json')
    await this.replaceCollection('invitations', invitations)
  }

  async seedUsers() {
    const users = this.readJSON<UserSeedingOptions[]>('users.json')
    const userIds = await Promise.all(
      users.map((user) => this.createUser(user)),
    )
    return userIds
  }

  async seedUserAppointments(userId: string, date: Date) {
    const values = [
      this.userDataFactory.appointment({
        userId,
        created: this.advanceDateByDays(date, -2),
        status: AppointmentStatus.booked,
        start: this.advanceDateByDays(date, 2),
        durationInMinutes: 30,
      }),
    ]

    await this.replaceCollection(`users/${userId}/appointments`, values)
  }

  async seedUserMedicationRequests(userId: string) {
    const values = [
      this.userDataFactory.medicationRequest({
        frequencyPerDay: 2,
        drugReference: DrugReference.eplerenone25,
        quantity: 2,
      }),
    ]
    await this.replaceCollection(`users/${userId}/medicationRequests`, values)
  }

  async seedUserMessages(userId: string) {
    const values = [
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
    ]
    await this.replaceCollection(`users/${userId}/messages`, values)
  }

  async seedUserBloodPressureObservations(userId: string, date: Date) {
    // This is just a list of pseudo-random numbers that is used to generate
    // the different user collections
    const randomNumbers = [
      77, 26, 85, 88, 0, 69, 5, 91, 83, 60, 67, 51, 28, 13, 6, 63, 36, 97, 52,
      11, 99, 53, 33, 98, 44, 39, 76, 78, 66, 73, 64, 68, 23, 32, 48, 71, 90,
      37, 8, 93, 12, 38, 43, 25, 40, 81, 65, 46, 42, 79, 21, 74, 75, 96, 56, 15,
      30, 95, 47, 89, 55, 84, 57, 9, 58, 24, 10, 45, 86, 61, 54, 87, 17, 41, 62,
      49, 34, 4, 92, 14, 59, 16, 18, 3, 35, 2, 72, 50, 22, 1, 80, 7, 29, 82, 31,
      94, 19, 27, 70, 20,
    ].map((n) => n / 100)

    const values = randomNumbers.map((number, index) =>
      this.userDataFactory.bloodPressureObservation({
        date: this.advanceDateByDays(date, -index - 2),
        systolic: 80 + number * 70,
        diastolic: 50 + number * 40,
      }),
    )

    await this.replaceCollection(
      `users/${userId}/bloodPressureObservations`,
      values,
    )
  }

  async seedUserBodyWeightObservations(userId: string, date: Date) {
    // This is just a list of pseudo-random numbers that is used to generate
    // the different user collections
    const randomNumbers = [
      88, 42, 11, 71, 4, 0, 86, 15, 41, 1, 98, 85, 90, 47, 84, 3, 61, 6, 77, 76,
      79, 63, 46, 53, 55, 78, 14, 34, 60, 92, 52, 43, 74, 87, 40, 10, 8, 69, 24,
      37, 97, 57, 83, 49, 22, 95, 17, 18, 44, 5, 80, 50, 29, 58, 39, 2, 70, 16,
      64, 56, 59, 19, 33, 99, 13, 23, 81, 27, 38, 65, 26, 45, 7, 72, 30, 28, 12,
      73, 31, 89, 25, 36, 96, 91, 35, 48, 21, 62, 51, 9, 68, 82, 93, 94, 54, 32,
      66, 20, 75, 67,
    ].map((n) => n / 100)

    const values = [
      this.userDataFactory.observation({
        date: this.advanceDateByDays(date, -2),
        value: 70,
        unit: QuantityUnit.kg,
        code: LoincCode.bodyWeight,
      }),
      ...randomNumbers.map((number, index) =>
        this.userDataFactory.observation({
          date: this.advanceDateByDays(date, -index - 3),
          value: 150 + number * 20,
          unit: QuantityUnit.lbs,
          code: LoincCode.bodyWeight,
        }),
      ),
    ]
    await this.replaceCollection(
      `users/${userId}/bodyWeightObservations`,
      values,
    )
  }

  async seedUserCreatinineObservations(userId: string, date: Date) {
    const values = [
      this.userDataFactory.observation({
        date: this.advanceDateByDays(date, -2),
        value: 1.2,
        unit: QuantityUnit.mg_dL,
        code: LoincCode.creatinine,
      }),
    ]

    await this.replaceCollection(
      `users/${userId}/creatinineObservations`,
      values,
    )
  }

  async seedUserDryWeightObservations(userId: string, date: Date) {
    const values = [
      this.userDataFactory.observation({
        date: this.advanceDateByDays(date, -2),
        value: 71.5,
        unit: QuantityUnit.kg,
        code: LoincCode.bodyWeight,
      }),
    ]

    await this.replaceCollection(
      `users/${userId}/dryWeightObservations`,
      values,
    )
  }

  async seedUserEgfrObservations(userId: string, date: Date) {
    const values = [
      this.userDataFactory.observation({
        date: this.advanceDateByDays(date, -2),
        value: 60,
        unit: QuantityUnit.mL_min_173m2,
        code: LoincCode.estimatedGlomerularFiltrationRate,
      }),
    ]

    await this.replaceCollection(`users/${userId}/eGfrObservations`, values)
  }

  async seedUserHeartRateObservations(userId: string, date: Date) {
    // This is just a list of pseudo-random numbers that is used to generate
    // the different user collections
    const randomNumbers = [
      88, 42, 11, 71, 4, 0, 86, 15, 41, 1, 98, 85, 90, 47, 84, 3, 61, 6, 77, 76,
      79, 63, 46, 53, 55, 78, 14, 34, 60, 92, 52, 43, 74, 87, 40, 10, 8, 69, 24,
      37, 97, 57, 83, 49, 22, 95, 17, 18, 44, 5, 80, 50, 29, 58, 39, 2, 70, 16,
      64, 56, 59, 19, 33, 99, 13, 23, 81, 27, 38, 65, 26, 45, 7, 72, 30, 28, 12,
      73, 31, 89, 25, 36, 96, 91, 35, 48, 21, 62, 51, 9, 68, 82, 93, 94, 54, 32,
      66, 20, 75, 67,
    ].map((n) => n / 100)

    const values = randomNumbers.map((number, index) =>
      this.userDataFactory.observation({
        date: this.advanceDateByDays(date, -index - 2),
        value: 60 + number * 40,
        unit: QuantityUnit.bpm,
        code: LoincCode.heartRate,
      }),
    )

    await this.replaceCollection(
      `users/${userId}/heartRateObservations`,
      values,
    )
  }

  async seedUserPotassiumObservations(userId: string, date: Date) {
    const values = [
      this.userDataFactory.observation({
        date: this.advanceDateByDays(date, -2),
        value: 4.2,
        unit: QuantityUnit.mEq_L,
        code: LoincCode.potassium,
      }),
    ]

    await this.replaceCollection(
      `users/${userId}/potassiumObservations`,
      values,
    )
  }

  async seedUserQuestionnaireResponses(userId: string, date: Date) {
    const questionnaire = this.readJSON<FHIRQuestionnaire[]>(
      'questionnaires.json',
    ).at(0)

    // This is just a list of pseudo-random numbers that is used to generate
    // the different user collections
    const randomNumbers = [
      97, 89, 38, 46, 75, 58, 24, 57, 55, 39, 16, 11, 72, 81, 96, 83, 92, 99,
      20, 93, 1, 12, 8, 87, 15, 18, 48, 37, 63, 74, 61, 68, 7, 73, 78, 71, 56,
      84, 9, 60, 10, 47, 80, 51, 13, 27, 35, 36, 43, 34, 95, 76, 23, 26, 0, 82,
      21, 4, 28, 41, 22, 62, 85, 17, 2, 42, 44, 70, 50, 3, 49, 6, 45, 52, 69,
      66, 31, 67, 19, 5, 64, 30, 77, 91, 90, 40, 29, 86, 32, 25, 14, 53, 98, 65,
      88, 33, 59, 79, 94, 54, 77, 51, 71, 44, 27, 88, 15, 70, 48, 50, 22, 38,
      29, 65, 64, 45, 42, 52, 90, 20, 1, 16, 47, 5, 33, 7, 91, 67, 28, 76, 66,
      82, 36, 58, 41, 87, 26, 24, 97, 8, 81, 32, 61, 37, 34, 84, 25, 83, 79, 57,
      12, 74, 94, 89, 46, 86, 55, 59, 98, 40, 69, 93, 95, 78, 17, 23, 2, 73, 96,
      68, 60, 39, 49, 85, 19, 80, 35, 0, 75, 14, 10, 31, 4, 13, 30, 62, 56, 18,
      21, 72, 3, 63, 92, 6, 99, 11, 54, 43, 53, 9, 97, 89, 38, 46, 75, 58, 24,
      57, 55, 39, 16, 11, 72, 81, 96, 83, 92, 99, 20, 93, 1, 12, 8, 87, 15, 18,
      48, 37, 63, 74, 61, 68, 7, 73, 78, 71, 56, 84, 9, 60, 10, 47, 80, 51, 13,
      27, 35, 36, 43, 34, 95, 76, 23, 26, 0, 82, 21, 4, 28, 41, 22, 62, 85, 17,
      2, 42, 44, 70, 50, 3, 49, 6, 45, 52, 69, 66, 31, 67, 19, 5, 64, 30, 77,
      91, 90, 40, 29, 86, 32, 25, 14, 53, 98, 65, 88, 33, 59, 79, 94, 54, 77,
      51, 71, 44, 27, 88, 15, 70, 48, 50, 22, 38, 29, 65, 64, 45, 42, 52, 90,
      20, 1, 16, 47, 5, 33, 7, 91, 67, 28, 76, 66, 82, 36, 58, 41, 87, 26, 24,
      97, 8, 81, 32, 61, 37, 34, 84, 25, 83, 79, 57, 12, 74, 94, 89, 46, 86, 55,
      59, 98, 40, 69, 93, 95, 78, 17, 23, 2, 73, 96, 68, 60, 39, 49, 85, 19, 80,
      35, 0, 75, 14, 10, 31, 4, 13, 30, 62, 56, 18, 21, 72, 3, 63, 92, 6, 99,
    ].map((n) => n / 100)

    const values = chunks(randomNumbers, 13).map((chunk, index) =>
      this.userDataFactory.questionnaireResponse({
        questionnaire: questionnaire?.id ?? '',
        questionnaireResponse: index.toString(),
        date: this.advanceDateByDays(date, -(index * 14) - 2),
        answer1a: Math.floor(1 + chunk[0] * 6),
        answer1b: Math.floor(1 + chunk[1] * 6),
        answer1c: Math.floor(1 + chunk[2] * 6),
        answer2: Math.floor(1 + chunk[3] * 5),
        answer3: Math.floor(1 + chunk[4] * 7),
        answer4: Math.floor(1 + chunk[5] * 7),
        answer5: Math.floor(1 + chunk[6] * 5),
        answer6: Math.floor(1 + chunk[7] * 5),
        answer7: Math.floor(1 + chunk[8] * 5),
        answer8a: Math.floor(1 + chunk[9] * 6),
        answer8b: Math.floor(1 + chunk[10] * 6),
        answer8c: Math.floor(1 + chunk[11] * 6),
        answer9: Math.floor(chunk[12] * 6),
      }),
    )
    await this.replaceCollection(
      `users/${userId}/questionnaireResponses`,
      values,
    )
  }

  // Helpers

  private advanceDateByDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
  }

  private async createUser(user: UserSeedingOptions): Promise<string> {
    const authUser = await this.auth.createUser(user.auth)
    await this.databaseService.runTransaction((firestore, transaction) => {
      transaction.set(firestore.doc(`users/${authUser.uid}`), user.user)
      for (const collectionName in user.collections ?? {}) {
        this.setUnstructuredCollection(
          firestore.collection(collectionName),
          user.collections?.[collectionName] ?? [],
          transaction,
        )
      }
    })
    return authUser.uid
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
