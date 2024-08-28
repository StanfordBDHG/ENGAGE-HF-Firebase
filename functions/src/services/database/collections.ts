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
} from '@stanfordbdhg/engagehf-models'
import { type Firestore } from 'firebase-admin/firestore'
import { DatabaseConverter } from './databaseConverter.js'

export enum UserObservationCollection {
  bodyWeight = 'bodyWeightObservations',
  bloodPressure = 'bloodPressureObservations',
  creatinine = 'creatinineObservations',
  dryWeight = 'dryWeightObservations',
  eGfr = 'eGfrObservations',
  heartRate = 'heartRateObservations',
  potassium = 'potassiumObservations',
}

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

  get invitations() {
    return this.firestore
      .collection('invitations')
      .withConverter(new DatabaseConverter(invitationConverter.value))
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
