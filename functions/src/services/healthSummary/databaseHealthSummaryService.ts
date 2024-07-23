//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type HealthSummaryService } from './healthSummaryService.js'
import {
  type MedicationOptimization,
  type HealthSummaryData,
} from '../../models/healthSummaryData.js'
import { type SymptomScore } from '../../models/symptomScore.js'
import { type Vitals } from '../../models/vitals.js'
import { CodingSystem, LoincCode } from '../codes.js'
import { type FhirService } from '../fhir/fhirService.js'
import { QuantityUnit } from '../fhir/quantityUnit.js'
import { type PatientService } from '../patient/patientService.js'
import { type UserService } from '../user/userService.js'

export class DefaultHealthSummaryService implements HealthSummaryService {
  // Properties

  private readonly fhirService: FhirService
  private readonly patientService: PatientService
  private readonly userService: UserService

  // Constructor

  constructor(
    fhirService: FhirService,
    patientService: PatientService,
    userService: UserService,
  ) {
    this.fhirService = fhirService
    this.patientService = patientService
    this.userService = userService
  }

  // Methods

  async getHealthSummaryData(userId: string): Promise<HealthSummaryData> {
    const [user, patient, nextAppointment, medications, symptomScores, vitals] =
      await Promise.all([
        this.userService.getAuth(userId),
        this.userService.getPatient(userId),
        this.patientService.getNextAppointment(userId),
        this.getMedications(userId),
        this.getSymptomScores(userId),
        this.getVitals(userId),
      ])

    const clinician =
      patient?.content.clinician ?
        await this.userService.getAuth(patient.content.clinician)
      : undefined

    return {
      name: user.displayName ?? '---',
      dateOfBirth: patient?.content.dateOfBirth,
      clinicianName: clinician?.displayName ?? '---',
      nextAppointment: nextAppointment?.content.start,
      medications: medications,
      vitals: vitals,
      symptomScores: symptomScores,
    }
  }

  // Methods - Symptom Scores

  private async getSymptomScores(userId: string): Promise<SymptomScore[]> {
    return (await this.patientService.getSymptomScores(userId)).map(
      (doc) => doc.content,
    )
  }

  // Methods - Medication Requests

  // eslint-disable-next-line @typescript-eslint/require-await
  private async getMedications(
    userId: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<MedicationOptimization[]> {
    return []
  }

  // Methods - Vitals

  private async getVitals(userId: string): Promise<Vitals> {
    const [
      [systolicBloodPressure, diastolicBloodPressure],
      heartRate,
      bodyWeight,
      creatinine,
      dryWeight,
      estimatedGlomerularFiltrationRate,
      potassium,
    ] = await Promise.all([
      this.getBloodPressureObservations(userId),
      this.getHeartRateObservations(userId),
      this.getBodyWeightObservations(userId),
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

  private async getBloodPressureObservations(userId: string) {
    const observationDocs =
      await this.patientService.getBloodPressureObservations(userId)
    const observations = observationDocs.map((doc) => doc.content)
    return [
      this.fhirService.extractObservationValues(observations, {
        code: LoincCode.bloodPressure,
        system: CodingSystem.loinc,
        unit: QuantityUnit.mmHg,
        component: {
          code: LoincCode.systolicBloodPressure,
          system: CodingSystem.loinc,
        },
      }),
      this.fhirService.extractObservationValues(observations, {
        code: LoincCode.bloodPressure,
        system: CodingSystem.loinc,
        unit: QuantityUnit.mmHg,
        component: {
          code: LoincCode.diastolicBloodPressure,
          system: CodingSystem.loinc,
        },
      }),
    ]
  }

  private async getBodyWeightObservations(userId: string) {
    const observationDocs =
      await this.patientService.getBodyWeightObservations(userId)
    return this.fhirService.extractObservationValues(
      observationDocs.map((doc) => doc.content),
      {
        code: LoincCode.bodyWeight,
        system: CodingSystem.loinc,
        unit: QuantityUnit.lbs,
      },
    )
  }

  private async getHeartRateObservations(userId: string) {
    const observationDocs =
      await this.patientService.getHeartRateObservations(userId)
    return this.fhirService.extractObservationValues(
      observationDocs.map((doc) => doc.content),
      {
        code: LoincCode.heartRate,
        system: CodingSystem.loinc,
        unit: QuantityUnit.bpm,
      },
    )
  }

  private async getMostRecentCreatinineObservation(userId: string) {
    const observation =
      await this.patientService.getMostRecentCreatinineObservation(userId)
    return observation ?
        this.fhirService
          .extractObservationValues([observation.content], {
            code: LoincCode.creatinine,
            system: CodingSystem.loinc,
            unit: QuantityUnit.mg_dL,
          })
          .at(0)
      : undefined
  }

  private async getMostRecentDryWeightObservation(userId: string) {
    const observation =
      await this.patientService.getMostRecentDryWeightObservation(userId)
    return observation ?
        this.fhirService
          .extractObservationValues([observation.content], {
            code: LoincCode.bodyWeight,
            system: CodingSystem.loinc,
            unit: QuantityUnit.lbs,
          })
          .at(0)
      : undefined
  }

  private async getMostRecentEstimatedGlomerularFiltrationRateObservation(
    userId: string,
  ) {
    const observation =
      await this.patientService.getMostRecentEstimatedGlomerularFiltrationRateObservation(
        userId,
      )
    return observation ?
        this.fhirService
          .extractObservationValues([observation.content], {
            code: LoincCode.estimatedGlomerularFiltrationRate,
            system: CodingSystem.loinc,
            unit: QuantityUnit.mL_min_173m2,
          })
          .at(0)
      : undefined
  }

  private async getMostRecentPotassiumObservation(userId: string) {
    const observation =
      await this.patientService.getMostRecentPotassiumObservation(userId)
    return observation ?
        this.fhirService
          .extractObservationValues([observation.content], {
            code: LoincCode.potassium,
            system: CodingSystem.loinc,
            unit: QuantityUnit.mEq_L,
          })
          .at(0)
      : undefined
  }
}
