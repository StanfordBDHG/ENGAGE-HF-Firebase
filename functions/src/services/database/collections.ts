//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type Firestore } from 'firebase-admin/firestore'
import { fhirMedicationRequestConverter } from '../../models/fhir/baseTypes/fhirElement.js'
import { fhirAllergyIntoleranceConverter } from '../../models/fhir/fhirAllergyIntolerance.js'
import { fhirAppointmentConverter } from '../../models/fhir/fhirAppointment.js'
import { fhirMedicationConverter } from '../../models/fhir/fhirMedication.js'
import { fhirObservationConverter } from '../../models/fhir/fhirObservation.js'
import { fhirQuestionnaireConverter } from '../../models/fhir/fhirQuestionnaire.js'
import { fhirQuestionnaireResponseConverter } from '../../models/fhir/fhirQuestionnaireResponse.js'
import { invitationConverter } from '../../models/types/invitation.js'
import { medicationClassConverter } from '../../models/types/medicationClass.js'
import { organizationConverter } from '../../models/types/organization.js'
import { symptomScoreConverter } from '../../models/types/symptomScore.js'
import { userConverter } from '../../models/types/user.js'
import { userDeviceConverter } from '../../models/types/userDevice.js'
import { userMedicationRecommendationConverter } from '../../models/types/userMedicationRecommendation.js'
import { userMessageConverter } from '../../models/types/userMessage.js'
import { videoConverter } from '../../models/types/video.js'
import { videoSectionConverter } from '../../models/types/videoSection.js'
import { historyChangeItemConverter } from '../history/historyService.js'

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
      .withConverter(fhirAppointmentConverter.value)
  }

  get history() {
    return this.firestore
      .collection('history')
      .withConverter(historyChangeItemConverter)
  }

  get invitations() {
    return this.firestore
      .collection('invitations')
      .withConverter(invitationConverter.value)
  }

  get medicationClasses() {
    return this.firestore
      .collection('medicationClasses')
      .withConverter(medicationClassConverter.value)
  }

  medicationClassReference(reference: string) {
    return this.firestore
      .doc(reference)
      .withConverter(medicationClassConverter.value)
  }

  get medications() {
    return this.firestore
      .collection('medications')
      .withConverter(fhirMedicationConverter.value)
  }

  medicationReference(reference: string) {
    return this.firestore
      .doc(reference)
      .withConverter(fhirMedicationConverter.value)
  }

  drugs(medicationId: string) {
    return this.firestore
      .collection('medications')
      .doc(medicationId)
      .collection('drugs')
      .withConverter(fhirMedicationConverter.value)
  }

  get organizations() {
    return this.firestore
      .collection('organizations')
      .withConverter(organizationConverter.value)
  }

  get questionnaires() {
    return this.firestore
      .collection('questionnaires')
      .withConverter(fhirQuestionnaireConverter.value)
  }

  get users() {
    return this.firestore.collection('users').withConverter(userConverter.value)
  }

  userAllergyIntolerances(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('allergyIntolerances')
      .withConverter(fhirAllergyIntoleranceConverter.value)
  }

  userAppointments(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('appointments')
      .withConverter(fhirAppointmentConverter.value)
  }

  userDevices(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('devices')
      .withConverter(userDeviceConverter.value)
  }

  userMedicationRecommendations(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('medicationRecommendations')
      .withConverter(userMedicationRecommendationConverter.value)
  }

  userMedicationRequests(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('medicationRequests')
      .withConverter(fhirMedicationRequestConverter.value)
  }

  userMessages(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('messages')
      .withConverter(userMessageConverter.value)
  }

  userObservations(userId: string, collection: UserObservationCollection) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection(collection)
      .withConverter(fhirObservationConverter.value)
  }

  userQuestionnaireResponses(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('questionnaireResponses')
      .withConverter(fhirQuestionnaireResponseConverter.value)
  }

  userSymptomScores(userId: string) {
    return this.firestore
      .collection('users')
      .doc(userId)
      .collection('symptomScores')
      .withConverter(symptomScoreConverter.value)
  }

  get videoSections() {
    return this.firestore
      .collection('videoSections')
      .withConverter(videoSectionConverter.value)
  }

  videos(videoSectionId: string) {
    return this.firestore
      .collection('videoSections')
      .doc(videoSectionId)
      .collection('videos')
      .withConverter(videoConverter.value)
  }
}
