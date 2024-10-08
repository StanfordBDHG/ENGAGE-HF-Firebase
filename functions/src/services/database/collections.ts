//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  fhirAllergyIntoleranceConverter,
  fhirAppointmentConverter,
  fhirMedicationConverter,
  fhirMedicationRequestConverter,
  fhirObservationConverter,
  fhirQuestionnaireConverter,
  fhirQuestionnaireResponseConverter,
  invitationConverter,
  medicationClassConverter,
  organizationConverter,
  symptomScoreConverter,
  userConverter,
  userDeviceConverter,
  userMedicationRecommendationConverter,
  userMessageConverter,
  videoConverter,
  videoSectionConverter,
  type UserObservationCollection,
} from '@stanfordbdhg/engagehf-models'
import { type Firestore } from 'firebase-admin/firestore'
import { DatabaseConverter } from './databaseConverter.js'
import { historyChangeItemConverter } from '../history/historyService.js'

export class CollectionsService {
  // Properties

  readonly firestore: Firestore

  // Constructor

  constructor(firestore: Firestore) {
    this.firestore = firestore
  }

  // Methods

  get appointments() {
    return this.firestore
      .collectionGroup('appointments')
      .withConverter(new DatabaseConverter(fhirAppointmentConverter.value))
  }

  get devices() {
    return this.firestore
      .collectionGroup('devices')
      .withConverter(new DatabaseConverter(userDeviceConverter.value))
  }

  get history() {
    return this.firestore
      .collection('history')
      .withConverter(new DatabaseConverter(historyChangeItemConverter))
  }

  get invitations() {
    return this.firestore
      .collection('invitations')
      .withConverter(new DatabaseConverter(invitationConverter.value))
  }

  invitationAllergyIntolerances(invitationId: string) {
    return this.firestore
      .collection('invitations')
      .doc(invitationId)
      .collection('allergyIntolerances')
      .withConverter(
        new DatabaseConverter(fhirAllergyIntoleranceConverter.value),
      )
  }

  invitationAppointments(invitationId: string) {
    return this.firestore
      .collection('invitations')
      .doc(invitationId)
      .collection('appointments')
      .withConverter(new DatabaseConverter(fhirAppointmentConverter.value))
  }

  invitationDevices(invitationId: string) {
    return this.firestore
      .collection('invitations')
      .doc(invitationId)
      .collection('devices')
      .withConverter(new DatabaseConverter(userDeviceConverter.value))
  }

  invitationMedicationRecommendations(invitationId: string) {
    return this.firestore
      .collection('invitations')
      .doc(invitationId)
      .collection('medicationRecommendations')
      .withConverter(
        new DatabaseConverter(userMedicationRecommendationConverter.value),
      )
  }

  invitationMedicationRequests(invitationId: string) {
    return this.firestore
      .collection('invitations')
      .doc(invitationId)
      .collection('medicationRequests')
      .withConverter(
        new DatabaseConverter(fhirMedicationRequestConverter.value),
      )
  }

  invitationMessages(invitationId: string) {
    return this.firestore
      .collection('invitations')
      .doc(invitationId)
      .collection('messages')
      .withConverter(new DatabaseConverter(userMessageConverter.value))
  }

  invitationObservations(
    invitationId: string,
    collection: UserObservationCollection,
  ) {
    return this.firestore
      .collection('invitations')
      .doc(invitationId)
      .collection(collection)
      .withConverter(new DatabaseConverter(fhirObservationConverter.value))
  }

  invitationQuestionnaireResponses(invitationId: string) {
    return this.firestore
      .collection('invitations')
      .doc(invitationId)
      .collection('questionnaireResponses')
      .withConverter(
        new DatabaseConverter(fhirQuestionnaireResponseConverter.value),
      )
  }

  invitationSymptomScores(invitationId: string) {
    return this.firestore
      .collection('invitations')
      .doc(invitationId)
      .collection('symptomScores')
      .withConverter(new DatabaseConverter(symptomScoreConverter.value))
  }

  get medicationClasses() {
    return this.firestore
      .collection('medicationClasses')
      .withConverter(new DatabaseConverter(medicationClassConverter.value))
  }

  medicationClassReference(reference: string) {
    return this.firestore
      .doc(reference)
      .withConverter(new DatabaseConverter(medicationClassConverter.value))
  }

  get medications() {
    return this.firestore
      .collection('medications')
      .withConverter(new DatabaseConverter(fhirMedicationConverter.value))
  }

  medicationReference(reference: string) {
    return this.firestore
      .doc(reference)
      .withConverter(new DatabaseConverter(fhirMedicationConverter.value))
  }

  drugs(medicationId: string) {
    return this.firestore
      .collection('medications')
      .doc(medicationId)
      .collection('drugs')
      .withConverter(new DatabaseConverter(fhirMedicationConverter.value))
  }

  get organizations() {
    return this.firestore
      .collection('organizations')
      .withConverter(new DatabaseConverter(organizationConverter.value))
  }

  get questionnaires() {
    return this.firestore
      .collection('questionnaires')
      .withConverter(new DatabaseConverter(fhirQuestionnaireConverter.value))
  }

  get users() {
    return this.firestore
      .collection('users')
      .withConverter(new DatabaseConverter(userConverter.value))
  }

  userAllergyIntolerances(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('allergyIntolerances')
      .withConverter(
        new DatabaseConverter(fhirAllergyIntoleranceConverter.value),
      )
  }

  userAppointments(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('appointments')
      .withConverter(new DatabaseConverter(fhirAppointmentConverter.value))
  }

  userDevices(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('devices')
      .withConverter(new DatabaseConverter(userDeviceConverter.value))
  }

  userMedicationRecommendations(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('medicationRecommendations')
      .withConverter(
        new DatabaseConverter(userMedicationRecommendationConverter.value),
      )
  }

  userMedicationRequests(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('medicationRequests')
      .withConverter(
        new DatabaseConverter(fhirMedicationRequestConverter.value),
      )
  }

  userMessages(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('messages')
      .withConverter(new DatabaseConverter(userMessageConverter.value))
  }

  userObservations(userId: string, collection: UserObservationCollection) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection(collection)
      .withConverter(new DatabaseConverter(fhirObservationConverter.value))
  }

  userQuestionnaireResponses(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('questionnaireResponses')
      .withConverter(
        new DatabaseConverter(fhirQuestionnaireResponseConverter.value),
      )
  }

  userSymptomScores(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('symptomScores')
      .withConverter(new DatabaseConverter(symptomScoreConverter.value))
  }

  get videoSections() {
    return this.firestore
      .collection('videoSections')
      .withConverter(new DatabaseConverter(videoSectionConverter.value))
  }

  videos(videoSectionId: string) {
    return this.firestore
      .collection('videoSections')
      .doc(videoSectionId)
      .collection('videos')
      .withConverter(new DatabaseConverter(videoConverter.value))
  }
}
