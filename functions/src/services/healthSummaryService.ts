//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { CodingSystem, LoincCode } from './codes.js'
import {
  type DatabaseDocument,
  type DatabaseService,
} from './database/databaseService.js'
import { type FhirService } from './fhir/fhirService.js'
import { QuantityUnit } from './fhir/quantityUnit.js'
import { type HealthSummaryData } from '../healthSummary/healthSummaryData.js'
import { type MedicationOptimization } from '../healthSummary/medication.js'
import { type Vitals } from '../healthSummary/vitals.js'
import { type FHIRObservation } from '../models/fhir/observation.js'
import { type KccqScore } from '../models/kccqScore.js'

export class HealthSummaryService {
  // Properties

  private databaseService: DatabaseService
  private fhirService: FhirService

  // Constructor

  constructor(databaseService: DatabaseService, fhirService: FhirService) {
    this.databaseService = databaseService
    this.fhirService = fhirService
  }

  // Methods

  async fetchHealthSummaryData(userId: string): Promise<HealthSummaryData> {
    const [
      userRecord,
      patient,
      nextAppointment,
      medications,
      kccqScores,
      vitals,
    ] = await Promise.all([
      this.databaseService.getUserRecord(userId),
      this.databaseService.getPatient(userId),
      this.databaseService.getNextAppointment(userId),
      this.getMedications(userId),
      this.getKccqScores(userId),
      this.getVitals(userId),
    ])

    const clinician =
      patient.content?.clinician ?
        await this.databaseService.getUserRecord(patient.content.clinician)
      : undefined

    return {
      name: userRecord.displayName ?? '---',
      dateOfBirth: patient.content?.dateOfBirth,
      clinicianName: clinician?.displayName ?? '---',
      nextAppointment: nextAppointment?.content?.start,
      medications: medications,
      vitals: {
        ...vitals,
      },
      symptomScores: kccqScores,
    }
  }

  // Methods - KCCQ Scores

  private async getKccqScores(userId: string): Promise<KccqScore[]> {
    return this.compactMapDocuments(this.databaseService.getKccqScores(userId))
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
      dryWeight: bodyWeight.at(-1)?.value ?? 0,
    }
  }

  private async getBloodPressureObservations(userId: string) {
    const observations = await this.compactMapDocuments<FHIRObservation>(
      this.databaseService.getBloodPressureObservations(userId),
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
      this.databaseService.getHeartRateObservations(userId),
    )
    return this.fhirService.extractObservationValues(observations, {
      code: LoincCode.heartRate,
      system: CodingSystem.loinc,
      unit: QuantityUnit.bpm,
    })
  }

  private async getBodyWeightObservations(userId: string) {
    const observations = await this.compactMapDocuments<FHIRObservation>(
      this.databaseService.getBodyWeightObservations(userId),
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
