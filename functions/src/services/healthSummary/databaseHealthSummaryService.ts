//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type HealthSummaryService } from './healthSummaryService.js'
import { type FHIRObservation } from '../../models/fhir/observation.js'
import {
  type MedicationOptimization,
  type HealthSummaryData,
} from '../../models/healthSummaryData.js'
import { type SymptomScore } from '../../models/symptomScore.js'
import { type Vitals } from '../../models/vitals.js'
import { type AuthService } from '../auth/authService.js'
import { CodingSystem, LoincCode } from '../codes.js'
import { type DatabaseDocument } from '../database/databaseService.js'
import { type FhirService } from '../fhir/fhirService.js'
import { QuantityUnit } from '../fhir/quantityUnit.js'
import { type PatientService } from '../patient/patientService.js'
import { type UserService } from '../user/userService.js'

export class DefaultHealthSummaryService implements HealthSummaryService {
  // Properties

  private readonly authService: AuthService
  private readonly fhirService: FhirService
  private readonly patientService: PatientService
  private readonly userService: UserService

  // Constructor

  constructor(
    authService: AuthService,
    fhirService: FhirService,
    patientService: PatientService,
    userService: UserService,
  ) {
    this.authService = authService
    this.fhirService = fhirService
    this.patientService = patientService
    this.userService = userService
  }

  // Methods

  async getHealthSummaryData(userId: string): Promise<HealthSummaryData> {
    const [user, patient, nextAppointment, medications, symptomScores, vitals] =
      await Promise.all([
        this.authService.getUser(userId),
        this.userService.getPatient(userId),
        this.patientService.getNextAppointment(userId),
        this.getMedications(userId),
        this.getSymptomScores(userId),
        this.getVitals(userId),
      ])

    const clinician =
      patient.content?.clinician ?
        await this.authService.getUser(patient.content.clinician)
      : undefined

    return {
      name: user.displayName ?? '---',
      dateOfBirth: patient.content?.dateOfBirth,
      clinicianName: clinician?.displayName ?? '---',
      nextAppointment: nextAppointment?.content.start,
      medications: medications,
      vitals: vitals,
      symptomScores: symptomScores,
    }
  }

  // Methods - Symptom Scores

  private async getSymptomScores(userId: string): Promise<SymptomScore[]> {
    return this.compactMapDocuments(
      this.patientService.getSymptomScores(userId),
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
    ] = await Promise.all([
      this.getBloodPressureObservations(userId),
      this.getHeartRateObservations(userId),
      this.getBodyWeightObservations(userId),
    ])
    return {
      systolicBloodPressure: systolicBloodPressure,
      diastolicBloodPressure: diastolicBloodPressure,
      heartRate: heartRate,
      bodyWeight: bodyWeight,
      // TODO: Implement the following properties
      creatinine: undefined,
      dryWeight: undefined,
      estimatedGlomerularFiltrationRate: undefined,
      potassium: undefined,
    }
  }

  private async getBloodPressureObservations(userId: string) {
    const observations = await this.compactMapDocuments<FHIRObservation>(
      this.patientService.getBloodPressureObservations(userId),
    )
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

  private async getHeartRateObservations(userId: string) {
    const observations = await this.compactMapDocuments<FHIRObservation>(
      this.patientService.getHeartRateObservations(userId),
    )
    return this.fhirService.extractObservationValues(observations, {
      code: LoincCode.heartRate,
      system: CodingSystem.loinc,
      unit: QuantityUnit.bpm,
    })
  }

  private async getBodyWeightObservations(userId: string) {
    const observations = await this.compactMapDocuments<FHIRObservation>(
      this.patientService.getBodyWeightObservations(userId),
    )
    return this.fhirService.extractObservationValues(observations, {
      code: LoincCode.bodyWeight,
      system: CodingSystem.loinc,
      unit: QuantityUnit.lbs,
    })
  }

  // Helpers

  private async compactMapDocuments<T>(
    documents: Promise<Array<DatabaseDocument<T>>>,
  ): Promise<T[]> {
    return documents.then((documents) =>
      documents.flatMap((document) =>
        document.content ? [document.content] : [],
      ),
    )
  }
}
