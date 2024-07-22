//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import {
  type DatabaseDocument,
  type DatabaseService,
} from './databaseService.js'
import { type FHIRQuestionnaireResponse } from '../../models/fhir/questionnaireResponse.js'

enum CacheKeyPrefix {
  getAppointments = 'getAppointments',
  getNextAppointment = 'getNextAppointment',
  getClinician = 'getClinician',
  getInvitation = 'getInvitation',
  getInvitationByUserId = 'getInvitationByUserId',
  getMedicationClasses = 'getMedicationClasses',
  getMedicationClass = 'getMedicationClass',
  getMedications = 'getMedications',
  getMedication = 'getMedication',
  getDrugs = 'getDrugs',
  getDrug = 'getDrug',
  getPatient = 'getPatient',
  getUser = 'getUser',
  getUserRecord = 'getUserRecord',
  getMedicationRecommendations = 'getMedicationRecommendations',
  getMedicationRequests = 'getMedicationRequests',
  getBloodPressureObservations = 'getBloodPressureObservations',
  getBodyWeightObservations = 'getBodyWeightObservations',
  getHeartRateObservations = 'getHeartRateObservations',
  getSymptomScores = 'getSymptomScores',
  getQuestionnaireResponses = 'getQuestionnaireResponses',
}

export class CacheDatabaseService implements DatabaseService {
  // Properties

  // The cacheMap is actually used with multiple types of promise results
  // since the implementation would get more complex if we were to use a separate property
  // for each cache key. The cache key is used to identify the promise result.
  //
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cacheMap = new Map<string, Promise<any>>()
  private databaseService: DatabaseService

  // Constructor

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService
  }

  // Appointments

  async getAppointments(userId: string) {
    return this.accessCache(CacheKeyPrefix.getAppointments, [userId], () =>
      this.databaseService.getAppointments(userId),
    )
  }

  async getNextAppointment(userId: string) {
    return this.accessCache(CacheKeyPrefix.getNextAppointment, [userId], () =>
      this.databaseService.getNextAppointment(userId),
    )
  }

  // Invitations

  async getInvitation(invitationId: string) {
    return this.accessCache(CacheKeyPrefix.getInvitation, [invitationId], () =>
      this.databaseService.getInvitation(invitationId),
    )
  }

  async getInvitationByUserId(userId: string) {
    return this.accessCache(
      CacheKeyPrefix.getInvitationByUserId,
      [userId],
      () => this.databaseService.getInvitationByUserId(userId),
    )
  }

  async setInvitationUserId(
    invitationId: string,
    userId: string,
  ): Promise<void> {
    return this.databaseService.setInvitationUserId(invitationId, userId)
  }

  async enrollUser(invitationId: string, userId: string) {
    return this.databaseService.enrollUser(invitationId, userId)
  }

  // Medications

  async getMedicationClasses() {
    return this.accessCache(CacheKeyPrefix.getMedicationClasses, [], () =>
      this.databaseService.getMedicationClasses(),
    )
  }

  async getMedicationClass(medicationClassId: string) {
    return this.accessCache(
      CacheKeyPrefix.getMedicationClass,
      [medicationClassId],
      () => this.databaseService.getMedicationClass(medicationClassId),
    )
  }

  async getMedications() {
    return this.accessCache(CacheKeyPrefix.getMedications, [], () =>
      this.databaseService.getMedications(),
    )
  }

  async getMedication(medicationId: string) {
    return this.accessCache(CacheKeyPrefix.getMedication, [medicationId], () =>
      this.databaseService.getMedication(medicationId),
    )
  }

  async getDrugs(medicationId: string) {
    return this.accessCache(CacheKeyPrefix.getDrugs, [medicationId], () =>
      this.databaseService.getDrugs(medicationId),
    )
  }

  async getDrug(medicationId: string, drugId: string) {
    return this.accessCache(
      CacheKeyPrefix.getDrug,
      [medicationId, drugId],
      () => this.databaseService.getDrug(medicationId, drugId),
    )
  }

  // Users

  async getClinician(userId: string) {
    return this.accessCache(CacheKeyPrefix.getClinician, [userId], () =>
      this.databaseService.getClinician(userId),
    )
  }

  async getPatient(userId: string) {
    return this.accessCache(CacheKeyPrefix.getPatient, [userId], () =>
      this.databaseService.getPatient(userId),
    )
  }

  async getUser(userId: string) {
    return this.accessCache(CacheKeyPrefix.getUser, [userId], () =>
      this.databaseService.getUser(userId),
    )
  }

  async getUserRecord(userId: string) {
    return this.accessCache(CacheKeyPrefix.getUserRecord, [userId], () =>
      this.databaseService.getUserRecord(userId),
    )
  }

  // Users - Medication Requests

  async getMedicationRecommendations(userId: string) {
    return this.accessCache(
      CacheKeyPrefix.getMedicationRecommendations,
      [userId],
      () => this.databaseService.getMedicationRecommendations(userId),
    )
  }

  async getMedicationRequests(userId: string) {
    return this.accessCache(
      CacheKeyPrefix.getMedicationRequests,
      [userId],
      () => this.databaseService.getMedicationRequests(userId),
    )
  }

  // Users - Messages

  async dismissMessage(
    userId: string,
    messageId: string,
    didPerformAction: boolean,
  ) {
    return this.databaseService.dismissMessage(
      userId,
      messageId,
      didPerformAction,
    )
  }

  // Users - Observations

  async getBloodPressureObservations(userId: string) {
    return this.accessCache(
      CacheKeyPrefix.getBloodPressureObservations,
      [userId],
      () => this.databaseService.getBloodPressureObservations(userId),
    )
  }

  async getBodyWeightObservations(userId: string) {
    return this.accessCache(
      CacheKeyPrefix.getBodyWeightObservations,
      [userId],
      () => this.databaseService.getBodyWeightObservations(userId),
    )
  }

  async getHeartRateObservations(userId: string) {
    return this.accessCache(
      CacheKeyPrefix.getHeartRateObservations,
      [userId],
      () => this.databaseService.getHeartRateObservations(userId),
    )
  }

  // Users - Questionnaire Responses

  async getQuestionnaireResponses(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRQuestionnaireResponse>>> {
    return this.accessCache(
      CacheKeyPrefix.getQuestionnaireResponses,
      [userId],
      () => this.databaseService.getQuestionnaireResponses(userId),
    )
  }

  async getSymptomScores(userId: string) {
    return this.accessCache(CacheKeyPrefix.getSymptomScores, [userId], () =>
      this.databaseService.getSymptomScores(userId),
    )
  }

  // Helpers

  private async accessCache<T>(
    prefix: CacheKeyPrefix,
    parameters: string[],
    fetch: () => Promise<T>,
  ): Promise<T> {
    const key = prefix + ':' + parameters.join(':')
    let promise = this.cacheMap.get(key)?.then((object) => object as T)
    if (promise) return promise
    promise = fetch()
    this.cacheMap.set(key, promise)
    return promise
  }
}
