//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { type Appointment } from '../../models/appointment.js'
import {
  type FHIRMedication,
  type FHIRMedicationRequest,
} from '../../models/fhir/medication.js'
import { type FHIRObservation } from '../../models/fhir/observation.js'
import { type Invitation } from '../../models/invitation.js'
import { type MedicationClass } from '../../models/medicationClass.js'
import { type SymptomScores } from '../../models/symptomScores.js'
import {
  type Clinician,
  type Patient,
  type User,
  type UserRecord,
} from '../../models/user.js'

export interface DatabaseDocument<Content> {
  id: string
  content: Content | undefined
}

export interface DatabaseService {
  // Appointments

  getAppointments(userId: string): Promise<Array<DatabaseDocument<Appointment>>>
  getNextAppointment(
    userId: string,
  ): Promise<DatabaseDocument<Appointment> | undefined>

  // Invitations

  getInvitation(invitationId: string): Promise<DatabaseDocument<Invitation>>
  setInvitationUserId(invitationId: string, userId: string): Promise<void>
  getInvitationByUserId(
    userId: string,
  ): Promise<DatabaseDocument<Invitation> | undefined>
  enrollUser(invitationId: string, userId: string): Promise<void>

  // Medications

  getMedicationClasses(): Promise<Array<DatabaseDocument<MedicationClass>>>
  getMedicationClass(
    medicationClassId: string,
  ): Promise<DatabaseDocument<MedicationClass>>

  getMedications(): Promise<Array<DatabaseDocument<FHIRMedication>>>
  getMedication(medicationId: string): Promise<DatabaseDocument<FHIRMedication>>

  getDrugs(
    medicationId: string,
  ): Promise<Array<DatabaseDocument<FHIRMedication>>>
  getDrug(
    medicationId: string,
    drugId: string,
  ): Promise<DatabaseDocument<FHIRMedication>>

  // Users

  getUserRecord(userId: string): Promise<UserRecord>
  getUser(userId: string): Promise<DatabaseDocument<User>>
  getClinician(userId: string): Promise<DatabaseDocument<Clinician>>
  getPatient(userId: string): Promise<DatabaseDocument<Patient>>

  // Users - Medication Requests

  getMedicationRecommendations(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRMedicationRequest>>>
  getMedicationRequests(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRMedicationRequest>>>

  // Users - Messages

  dismissMessage(
    userId: string,
    messageId: string,
    didPerformAction: boolean,
  ): Promise<void>

  // Users - Observations

  getBloodPressureObservations(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRObservation>>>
  getBodyWeightObservations(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRObservation>>>
  getHeartRateObservations(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRObservation>>>

  // Users - Questionnaire Responses

  getSymptomScores(
    userId: string,
  ): Promise<Array<DatabaseDocument<SymptomScores>>>
}
