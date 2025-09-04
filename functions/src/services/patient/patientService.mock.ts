//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  advanceDateByDays,
  DrugReference,
  type FHIRAllergyIntolerance,
  FHIRAppointment,
  FHIRAppointmentStatus,
  FHIRMedicationRequest,
  type FHIRQuestionnaireResponse,
  type FHIRReference,
  type LoincCode,
  type Observation,
  QuantityUnit,
  SymptomScore,
  type UserMedicationRecommendation,
  type UserObservationCollection,
  type UserShareCode,
} from "@stanfordbdhg/engagehf-models";
import { type PatientService } from "./patientService.js";
import { mockQuestionnaireResponse } from "../../tests/mocks/questionnaireResponse.js";
import { type Document } from "../database/databaseService.js";

/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */

export class MockPatientService implements PatientService {
  // Properties

  private readonly startDate: Date;

  // Constructor

  constructor(startDate: Date = new Date(2024, 2, 2, 12, 30)) {
    this.startDate = startDate;
  }

  // Methods - Appointments

  async getEveryAppoinment(
    fromDate: Date,
    toDate: Date,
  ): Promise<Array<Document<FHIRAppointment>>> {
    return [];
  }
  async getAppointments(
    userId: string,
  ): Promise<Array<Document<FHIRAppointment>>> {
    return [];
  }
  async getNextAppointment(
    userId: string,
  ): Promise<Document<FHIRAppointment> | undefined> {
    return {
      id: "123",
      lastUpdate: new Date(),
      path: `users/${userId}/appointments/123`,
      content: FHIRAppointment.create({
        userId,
        status: FHIRAppointmentStatus.booked,
        created: advanceDateByDays(this.startDate, -10),
        start: advanceDateByDays(this.startDate, 1),
        durationInMinutes: 60,
      }),
    };
  }

  async createAppointment(
    userId: string,
    appointment: FHIRAppointment,
  ): Promise<void> {
    return;
  }

  // Methods - Contraindications

  async getContraindications(
    userId: string,
  ): Promise<Array<Document<FHIRAllergyIntolerance>>> {
    return [];
  }

  // Methods - Medication Requests

  async getMedicationRequests(
    userId: string,
  ): Promise<Array<Document<FHIRMedicationRequest>>> {
    const values: FHIRMedicationRequest[] = [
      FHIRMedicationRequest.create({
        medicationReference: DrugReference.carvedilol3_125,
        frequencyPerDay: 1,
        quantity: 2,
      }),
    ];
    return values.map((value, index) => ({
      id: index.toString(),
      lastUpdate: new Date(),
      path: `users/${userId}/medicationRequests/${index}`,
      content: value,
    }));
  }

  async replaceMedicationRequests(
    userId: string,
    values: FHIRMedicationRequest[],
    keepUnchanged?: (request: Document<FHIRMedicationRequest>) => boolean,
  ): Promise<void> {
    return;
  }

  async getMedicationRecommendations(
    userId: string,
  ): Promise<Array<Document<UserMedicationRecommendation>>> {
    const values: UserMedicationRecommendation[] = [];
    return values.map((value, index) => ({
      id: index.toString(),
      lastUpdate: new Date(),
      path: `users/${userId}/medicationRecommendations/${index}`,
      content: value,
    }));
  }

  async replaceMedicationRecommendations(
    userId: string,
    recommendations: UserMedicationRecommendation[],
  ): Promise<void> {
    return;
  }

  // Methods - Observations

  async getBloodPressureObservations(
    userId: string,
  ): Promise<[Observation[], Observation[]]> {
    const values = [
      this.bloodPressureObservations(110, 70, new Date(2024, 1, 30, 12, 30)),
      this.bloodPressureObservations(114, 82, new Date(2024, 1, 29, 12, 30)),
      this.bloodPressureObservations(123, 75, new Date(2024, 1, 28, 12, 30)),
      this.bloodPressureObservations(109, 77, new Date(2024, 1, 27, 12, 30)),
      this.bloodPressureObservations(105, 72, new Date(2024, 1, 26, 12, 30)),
      this.bloodPressureObservations(98, 68, new Date(2024, 1, 25, 12, 30)),
      this.bloodPressureObservations(94, 65, new Date(2024, 1, 24, 12, 30)),
      this.bloodPressureObservations(104, 72, new Date(2024, 1, 23, 12, 30)),
      this.bloodPressureObservations(102, 80, new Date(2024, 1, 22, 12, 30)),
    ];
    return [values.map((value) => value[0]), values.map((value) => value[1])];
  }

  private bloodPressureObservations(
    systolicBloodPressure: number,
    diastolicBloodPressure: number,
    date: Date,
  ): [Observation, Observation] {
    return [
      {
        value: systolicBloodPressure,
        unit: QuantityUnit.mmHg,
        date: date,
      },
      {
        value: diastolicBloodPressure,
        unit: QuantityUnit.mmHg,
        date: date,
      },
    ];
  }

  async getBodyWeightObservations(userId: string): Promise<Observation[]> {
    return [
      this.bodyWeightObservation(
        269,
        QuantityUnit.lbs,
        new Date(2024, 1, 30, 12, 30),
      ),
      this.bodyWeightObservation(
        267,
        QuantityUnit.lbs,
        new Date(2024, 1, 29, 12, 30),
      ),
      this.bodyWeightObservation(
        267,
        QuantityUnit.lbs,
        new Date(2024, 1, 28, 12, 30),
      ),
      this.bodyWeightObservation(
        265,
        QuantityUnit.lbs,
        new Date(2024, 1, 27, 12, 30),
      ),
      this.bodyWeightObservation(
        268,
        QuantityUnit.lbs,
        new Date(2024, 1, 26, 12, 30),
      ),
      this.bodyWeightObservation(
        268,
        QuantityUnit.lbs,
        new Date(2024, 1, 25, 12, 30),
      ),
      this.bodyWeightObservation(
        266,
        QuantityUnit.lbs,
        new Date(2024, 1, 24, 12, 30),
      ),
      this.bodyWeightObservation(
        266,
        QuantityUnit.lbs,
        new Date(2024, 1, 23, 12, 30),
      ),
      this.bodyWeightObservation(
        267,
        QuantityUnit.lbs,
        new Date(2024, 1, 22, 12, 30),
      ),
    ];
  }

  private bodyWeightObservation(
    value: number,
    unit: QuantityUnit,
    date: Date,
  ): Observation {
    return {
      date: date,
      value: value,
      unit: unit,
    };
  }

  async getHeartRateObservations(userId: string): Promise<Observation[]> {
    return [
      this.heartRateObservation(79, new Date(2024, 1, 30, 12, 30)),
      this.heartRateObservation(62, new Date(2024, 1, 29, 12, 30)),
      this.heartRateObservation(77, new Date(2024, 1, 28, 12, 30)),
      this.heartRateObservation(63, new Date(2024, 1, 27, 12, 30)),
      this.heartRateObservation(61, new Date(2024, 1, 26, 12, 30)),
      this.heartRateObservation(70, new Date(2024, 1, 25, 12, 30)),
      this.heartRateObservation(67, new Date(2024, 1, 24, 12, 30)),
      this.heartRateObservation(80, new Date(2024, 1, 23, 12, 30)),
      this.heartRateObservation(65, new Date(2024, 1, 22, 12, 30)),
    ];
  }

  private heartRateObservation(value: number, date: Date): Observation {
    return {
      date: date,
      value: value,
      unit: QuantityUnit.bpm,
    };
  }

  async getMostRecentCreatinineObservation(
    userId: string,
  ): Promise<Observation | undefined> {
    return {
      date: new Date("2024-01-29"),
      value: 1.1,
      unit: QuantityUnit.mg_dL,
    };
  }

  async getMostRecentDryWeightObservation(
    userId: string,
    unit: QuantityUnit,
  ): Promise<Observation | undefined> {
    return {
      date: new Date(2024, 1, 27, 12, 30),
      value: 267.5,
      unit: QuantityUnit.lbs,
    };
  }

  async getMostRecentEstimatedGlomerularFiltrationRateObservation(): Promise<
    Observation | undefined
  > {
    return {
      date: new Date("2024-01-29"),
      value: 60,
      unit: QuantityUnit.mL_min_173m2,
    };
  }

  async getMostRecentPotassiumObservation(): Promise<Observation | undefined> {
    return {
      date: new Date("2024-01-29"),
      unit: QuantityUnit.mEq_L,
      value: 4.2,
    };
  }

  async createObservations(
    userId: string,
    values: Array<{
      observation: Observation;
      loincCode: LoincCode;
      collection: UserObservationCollection;
    }>,
    reference: FHIRReference | null,
  ): Promise<void> {
    return;
  }

  // Methods - Questionnaire Responses

  async getQuestionnaireResponses(
    userId: string,
  ): Promise<Array<Document<FHIRQuestionnaireResponse>>> {
    return [mockQuestionnaireResponse()].map((value, index) => ({
      id: index.toString(),
      lastUpdate: new Date(),
      path: `users/${userId}/questionnaireResponses/${index}`,
      content: value,
    }));
  }

  async getSymptomScores(
    userId: string,
    options?: { limit?: number },
  ): Promise<Array<Document<SymptomScore>>> {
    const values: SymptomScore[] = [
      new SymptomScore({
        questionnaireResponseId: "4",
        overallScore: 40,
        physicalLimitsScore: 50,
        socialLimitsScore: 38,
        qualityOfLifeScore: 20,
        symptomFrequencyScore: 60,
        dizzinessScore: 3,
        date: new Date(2024, 1, 22, 12, 30),
      }),
      new SymptomScore({
        questionnaireResponseId: "3",
        overallScore: 60,
        physicalLimitsScore: 58,
        socialLimitsScore: 75,
        qualityOfLifeScore: 37,
        symptomFrequencyScore: 72,
        dizzinessScore: 2,
        date: new Date(2024, 1, 13, 12, 30),
      }),
      new SymptomScore({
        questionnaireResponseId: "2",
        overallScore: 44,
        physicalLimitsScore: 50,
        socialLimitsScore: 41,
        qualityOfLifeScore: 25,
        symptomFrequencyScore: 60,
        dizzinessScore: 1,
        date: new Date(2023, 12, 28, 12, 30),
      }),
      new SymptomScore({
        questionnaireResponseId: "1",
        overallScore: 75,
        physicalLimitsScore: 58,
        socialLimitsScore: 75,
        qualityOfLifeScore: 60,
        symptomFrequencyScore: 80,
        dizzinessScore: 1,
        date: new Date(2023, 12, 13, 12, 30),
      }),
    ];
    return values.map((value, index) => ({
      id: index.toString(),
      lastUpdate: new Date(),
      path: `users/${userId}/symptomScores/${index}`,
      content: value,
    }));
  }

  async getLatestSymptomScore(
    userId: string,
  ): Promise<Document<SymptomScore> | undefined> {
    return (await this.getSymptomScores(userId, { limit: 1 })).at(0);
  }

  async updateSymptomScore(
    userId: string,
    symptomScoreId: string,
    symptomScore: SymptomScore | null,
  ): Promise<void> {
    return;
  }

  // Share Code

  async createShareCode(userId: string): Promise<Document<UserShareCode>> {
    return {
      id: "123",
      lastUpdate: new Date(),
      path: "users/123/shareCode/123",
      content: {
        code: "12345678",
        tries: 0,
        expiresAt: new Date(2024, 2, 2, 12, 30),
      },
    };
  }

  async validateShareCode(
    userId: string,
    documentId: string,
    code: string,
  ): Promise<boolean> {
    return false;
  }
}
