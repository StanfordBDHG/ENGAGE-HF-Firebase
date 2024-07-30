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
import { type Invitation } from '../../../models/invitation.js'
import { DrugReference, LoincCode } from '../../codes.js'
import { type DatabaseService } from '../../database/databaseService.js'
import { QuantityUnit } from '../../fhir/quantityUnit.js'
import { SeedingService } from '../seedingService.js'
import { FHIRObservation } from '../../../models/fhir/observation.js'

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
    const userIds = await Promise.all(
      input.users.map((user) => this.createUser(user)),
    )

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
    let values: FHIRObservation[] = []
    for (let index = 0; index < 100; index += 1) {
      values.push(
        this.userDataFactory.bloodPressureObservation({
          date: this.advanceDateByDays(date, -index * 0.7),
          systolic: 80 + Math.sin(index) * (150-80),
          diastolic: 50 + Math.sin(index + 0.4) * (90-50),
        }),
      )
    }

    await this.replaceCollection(
      `users/${userId}/bloodPressureObservations`,
      values,
    )
  }

  async seedUserBodyWeightObservations(userId: string, date: Date) {
    const values = [
      this.userDataFactory.observation({
        date: this.advanceDateByDays(date, -2),
        value: 70,
        unit: QuantityUnit.kg,
        code: LoincCode.bodyWeight,
      }),
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
        value: 70,
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
    const values = [
      this.userDataFactory.observation({
        date: this.advanceDateByDays(date, -2),
        value: 70,
        unit: QuantityUnit.bpm,
        code: LoincCode.heartRate,
      }),
    ]

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
    const values = {
      '123': this.userDataFactory.questionnaireResponse({
        questionnaire: questionnaire?.id ?? '',
        questionnaireResponse: '123',
        date: this.advanceDateByDays(date, -2),
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
