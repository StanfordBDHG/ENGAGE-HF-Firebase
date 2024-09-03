//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  advanceDateByDays,
  type QuantityUnit,
  type SymptomScore,
  type UserMedicationRecommendation,
} from '@stanfordbdhg/engagehf-models'
import { type HealthSummaryService } from './healthSummaryService.js'
import {
  type HealthSummaryVitals,
  type HealthSummaryData,
} from '../../models/healthSummaryData.js'
import { type PatientService } from '../patient/patientService.js'
import { type UserService } from '../user/userService.js'

export class DefaultHealthSummaryService implements HealthSummaryService {
  // Properties

  private readonly patientService: PatientService
  private readonly userService: UserService

  // Constructor

  constructor(patientService: PatientService, userService: UserService) {
    this.patientService = patientService
    this.userService = userService
  }

  // Methods

  async getHealthSummaryData(
    userId: string,
    weightUnit: QuantityUnit,
  ): Promise<HealthSummaryData> {
    const [
      auth,
      patient,
      nextAppointment,
      recommendations,
      symptomScores,
      vitals,
    ] = await Promise.all([
      this.userService.getAuth(userId),
      this.userService.getUser(userId),
      this.patientService.getNextAppointment(userId),
      this.getMedicationRecommendations(userId),
      this.getSymptomScores(userId, { limit: 5 }),
      this.getVitals(userId, advanceDateByDays(new Date(), -14), weightUnit),
    ])

    const clinician =
      patient?.content.clinician ?
        await this.userService.getAuth(patient.content.clinician)
      : undefined

    const dateOfBirth = patient?.content.dateOfBirth
    const nextAppointmentStart = nextAppointment?.content.start
    return {
      name: auth.displayName,
      dateOfBirth: dateOfBirth ?? undefined,
      clinicianName: clinician?.displayName,
      nextAppointment: nextAppointmentStart ?? undefined,
      recommendations: recommendations,
      vitals: vitals,
      symptomScores: symptomScores,
    }
  }

  // Methods - Symptom Scores

  async getSymptomScores(
    userId: string,
    options: { limit?: number } = {},
  ): Promise<SymptomScore[]> {
    const result = await this.patientService.getSymptomScores(userId, options)
    return result.map((doc) => doc.content)
  }

  // Methods - Medication Recommendations

  async getMedicationRecommendations(
    userId: string,
  ): Promise<UserMedicationRecommendation[]> {
    const result =
      await this.patientService.getMedicationRecommendations(userId)
    return result.map((doc) => doc.content)
  }

  // Helpers

  private async getVitals(
    userId: string,
    cutoffDate: Date,
    weightUnit: QuantityUnit,
  ): Promise<HealthSummaryVitals> {
    const [
      [systolicBloodPressure, diastolicBloodPressure],
      heartRate,
      bodyWeight,
      dryWeight,
    ] = await Promise.all([
      this.patientService.getBloodPressureObservations(userId, cutoffDate),
      this.patientService.getHeartRateObservations(userId, cutoffDate),
      this.patientService.getBodyWeightObservations(
        userId,
        weightUnit,
        cutoffDate,
      ),
      this.patientService.getMostRecentDryWeightObservation(userId, weightUnit),
    ])
    return {
      systolicBloodPressure: systolicBloodPressure,
      diastolicBloodPressure: diastolicBloodPressure,
      heartRate: heartRate,
      bodyWeight: bodyWeight,
      dryWeight: dryWeight,
    }
  }
}
