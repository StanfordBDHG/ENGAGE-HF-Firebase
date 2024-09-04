//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  advanceDateByDays,
<<<<<<< Updated upstream
  CodingSystem,
  LoincCode,
  type Observation,
  QuantityUnit,
  type SymptomScore,
  type UserMedicationRecommendation,
=======
  type QuantityUnit,
>>>>>>> Stashed changes
} from '@stanfordbdhg/engagehf-models'
import { type HealthSummaryService } from './healthSummaryService.js'
import { type HealthSummaryData } from '../../models/healthSummaryData.js'
import { type Vitals } from '../../models/vitals.js'
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

  // Methods - Vitals

  async getVitals(
    userId: string,
    cutoffDate: Date,
    weightUnit: QuantityUnit,
  ): Promise<Vitals> {
    const [
      [systolicBloodPressure, diastolicBloodPressure],
      heartRate,
      bodyWeight,
      creatinine,
      dryWeight,
      estimatedGlomerularFiltrationRate,
      potassium,
    ] = await Promise.all([
      this.getBloodPressureObservations(userId, cutoffDate),
      this.getHeartRateObservations(userId, cutoffDate),
      this.getBodyWeightObservations(userId, cutoffDate, weightUnit),
      this.getMostRecentCreatinineObservation(userId),
      this.getMostRecentDryWeightObservation(userId),
      this.getMostRecentEstimatedGlomerularFiltrationRateObservation(userId),
      this.getMostRecentPotassiumObservation(userId),
    ])
    return {
      systolicBloodPressure: systolicBloodPressure,
      diastolicBloodPressure: diastolicBloodPressure,
      heartRate: heartRate,
      bodyWeight: bodyWeight,
      creatinine: creatinine,
      dryWeight: dryWeight,
      estimatedGlomerularFiltrationRate: estimatedGlomerularFiltrationRate,
      potassium: potassium,
    }
  }

  async getBloodPressureObservations(
    userId: string,
    cutoffDate: Date,
  ): Promise<[Observation[], Observation[]]> {
    const observationDocs =
      await this.patientService.getBloodPressureObservations(userId, cutoffDate)
    const observations = observationDocs.map((doc) => doc.content)
    return [
      observations.flatMap((observation) =>
        observation.observations({
          code: LoincCode.bloodPressure,
          system: CodingSystem.loinc,
          unit: QuantityUnit.mmHg,
          component: {
            code: LoincCode.systolicBloodPressure,
            system: CodingSystem.loinc,
          },
        }),
      ),
      observations.flatMap((observation) =>
        observation.observations({
          code: LoincCode.bloodPressure,
          system: CodingSystem.loinc,
          unit: QuantityUnit.mmHg,
          component: {
            code: LoincCode.diastolicBloodPressure,
            system: CodingSystem.loinc,
          },
        }),
      ),
    ]
  }

  async getBodyWeightObservations(
    userId: string,
    cutoffDate: Date,
    unit: QuantityUnit,
  ) {
    const docs = await this.patientService.getBodyWeightObservations(
      userId,
      cutoffDate,
    )
    return docs.flatMap((doc) =>
      doc.content.observations({
        code: LoincCode.bodyWeight,
        system: CodingSystem.loinc,
        unit: unit,
      }),
    )
  }

  async getHeartRateObservations(userId: string, cutoffDate: Date) {
    const docs = await this.patientService.getHeartRateObservations(
      userId,
      cutoffDate,
    )
    return docs.flatMap((doc) =>
      doc.content.observations({
        code: LoincCode.heartRate,
        system: CodingSystem.loinc,
        unit: QuantityUnit.bpm,
      }),
    )
  }

  async getMostRecentCreatinineObservation(userId: string) {
    const observation =
      await this.patientService.getMostRecentCreatinineObservation(userId)
    return observation?.content
      .observations({
        code: LoincCode.creatinine,
        system: CodingSystem.loinc,
        unit: QuantityUnit.mg_dL,
      })
      .at(0)
  }

  async getMostRecentDryWeightObservation(userId: string) {
    const observation =
      await this.patientService.getMostRecentDryWeightObservation(userId)
    return observation?.content
      .observations({
        code: LoincCode.bodyWeight,
        system: CodingSystem.loinc,
        unit: QuantityUnit.lbs,
      })
      .at(0)
  }

  async getMostRecentEstimatedGlomerularFiltrationRateObservation(
    userId: string,
  ) {
    const observation =
      await this.patientService.getMostRecentEstimatedGlomerularFiltrationRateObservation(
        userId,
      )
    return observation?.content
      .observations({
        code: LoincCode.estimatedGlomerularFiltrationRate,
        system: CodingSystem.loinc,
        unit: QuantityUnit.mL_min_173m2,
      })
      .at(0)
  }

  async getMostRecentPotassiumObservation(userId: string) {
    const observation =
      await this.patientService.getMostRecentPotassiumObservation(userId)
    return observation?.content
      .observations({
        code: LoincCode.potassium,
        system: CodingSystem.loinc,
        unit: QuantityUnit.mEq_L,
      })
      .at(0)
  }
}
