//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  advanceDateByDays,
  FHIRAppointment,
  FHIRAppointmentStatus,
  LocalizedText,
  type Observation,
  QuantityUnit,
  UserMedicationRecommendationType,
} from '@stanfordbdhg/engagehf-models'
import { type HealthSummaryService } from './healthSummaryService.js'
import {
  HealthSummaryData,
  type HealthSummaryVitals,
} from '../../models/healthSummaryData.js'

/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */

export class MockHealthSummaryService implements HealthSummaryService {
  // Properties

  private readonly startDate: Date

  // Constructor

  constructor(startDate: Date = new Date(2024, 2, 2, 12, 30)) {
    this.startDate = startDate
  }

  // Methods

  async getHealthSummaryData(userId: string): Promise<HealthSummaryData> {
    return new HealthSummaryData({
      name: 'John Doe',
      dateOfBirth: new Date('1970-01-02'),
      providerName: 'Dr. XXX',
      nextAppointment: FHIRAppointment.create({
        userId,
        status: FHIRAppointmentStatus.booked,
        created: this.startDateAdvancedByDays(-10),
        start: this.startDateAdvancedByDays(1),
        durationInMinutes: 60,
      }),
      recommendations: [
        {
          currentMedication: [],
          displayInformation: {
            title: new LocalizedText('Losartan (Cozaar)'),
            subtitle: new LocalizedText(''),
            description: new LocalizedText(
              'Switch to Sacubitril-Valsartan (More Effective Medication)',
            ),
            type: UserMedicationRecommendationType.improvementAvailable,
            dosageInformation: {
              minimumSchedule: [{ frequency: 1, quantity: [25] }],
              currentSchedule: [{ frequency: 1, quantity: [25] }],
              targetSchedule: [{ frequency: 1, quantity: [100] }],
              unit: 'mg',
            },
          },
        },
        {
          currentMedication: [],
          displayInformation: {
            title: new LocalizedText('Dapagliflozin (Farxiga)'),
            subtitle: new LocalizedText(''),
            description: new LocalizedText('Continue Dose'),
            type: UserMedicationRecommendationType.targetDoseReached,
            dosageInformation: {
              minimumSchedule: [{ frequency: 1, quantity: [5] }],
              currentSchedule: [{ frequency: 1, quantity: [10] }],
              targetSchedule: [{ frequency: 1, quantity: [10] }],
              unit: 'mg',
            },
          },
        },
        {
          currentMedication: [],
          displayInformation: {
            title: new LocalizedText('Carvedilol (Coreg)'),
            subtitle: new LocalizedText(''),
            description: new LocalizedText('Start Medication'),
            type: UserMedicationRecommendationType.notStarted,
            dosageInformation: {
              minimumSchedule: [{ frequency: 1, quantity: [5] }],
              currentSchedule: [],
              targetSchedule: [{ frequency: 2, quantity: [50] }],
              unit: 'mg',
            },
          },
        },
      ],
      vitals: await this.getVitals(userId),
      symptomScores: [
        {
          questionnaireResponseId: '4',
          overallScore: 40,
          physicalLimitsScore: 50,
          socialLimitsScore: 38,
          qualityOfLifeScore: 20,
          symptomFrequencyScore: 60,
          dizzinessScore: 3,
          date: this.startDateAdvancedByDays(-9),
        },
        {
          questionnaireResponseId: '3',
          overallScore: 60,
          physicalLimitsScore: 58,
          socialLimitsScore: 75,
          qualityOfLifeScore: 37,
          symptomFrequencyScore: 72,
          dizzinessScore: 2,
          date: this.startDateAdvancedByDays(-18),
        },
        {
          questionnaireResponseId: '2',
          overallScore: 44,
          physicalLimitsScore: 50,
          socialLimitsScore: 41,
          qualityOfLifeScore: 25,
          symptomFrequencyScore: 60,
          dizzinessScore: 1,
          date: this.startDateAdvancedByDays(-34),
        },
        {
          questionnaireResponseId: '1',
          overallScore: 75,
          physicalLimitsScore: 58,
          socialLimitsScore: 75,
          qualityOfLifeScore: 60,
          symptomFrequencyScore: 80,
          dizzinessScore: 1,
          date: this.startDateAdvancedByDays(-49),
        },
      ],
    })
  }

  async getVitals(userId: string): Promise<HealthSummaryVitals> {
    const [systolicBloodPressure, diastolicBloodPressure] =
      await this.getBloodPressureObservations(userId, this.startDate)
    return {
      systolicBloodPressure: systolicBloodPressure,
      diastolicBloodPressure: diastolicBloodPressure,
      heartRate: await this.getHeartRateObservations(userId, this.startDate),
      bodyWeight: await this.getBodyWeightObservations(
        userId,
        this.startDate,
        QuantityUnit.lbs,
      ),
      dryWeight: await this.getMostRecentDryWeightObservation(userId),
    }
  }

  async getBloodPressureObservations(
    userId: string,
    cutoffDate: Date,
  ): Promise<[Observation[], Observation[]]> {
    return [
      [
        {
          date: this.startDateAdvancedByDays(-1),
          value: 110,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-2),
          value: 114,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-3),
          value: 123,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-4),
          value: 109,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-5),
          value: 105,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-6),
          value: 98,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-7),
          value: 94,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-8),
          value: 104,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-9),
          value: 102,
          unit: QuantityUnit.mmHg,
        },
      ],
      [
        {
          date: this.startDateAdvancedByDays(-1),
          value: 70,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-2),
          value: 82,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-3),
          value: 75,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-4),
          value: 77,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-5),
          value: 72,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-6),
          value: 68,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-7),
          value: 65,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-8),
          value: 72,
          unit: QuantityUnit.mmHg,
        },
        {
          date: this.startDateAdvancedByDays(-9),
          value: 80,
          unit: QuantityUnit.mmHg,
        },
      ],
    ]
  }

  async getHeartRateObservations(
    userId: string,
    cutoffDate: Date,
  ): Promise<Observation[]> {
    return [
      {
        date: this.startDateAdvancedByDays(-1),
        value: 79,
        unit: QuantityUnit.bpm,
      },
      {
        date: this.startDateAdvancedByDays(-2),
        value: 62,
        unit: QuantityUnit.bpm,
      },
      {
        date: this.startDateAdvancedByDays(-3),
        value: 77,
        unit: QuantityUnit.bpm,
      },
      {
        date: this.startDateAdvancedByDays(-4),
        value: 63,
        unit: QuantityUnit.bpm,
      },
      {
        date: this.startDateAdvancedByDays(-5),
        value: 61,
        unit: QuantityUnit.bpm,
      },
      {
        date: this.startDateAdvancedByDays(-6),
        value: 70,
        unit: QuantityUnit.bpm,
      },
      {
        date: this.startDateAdvancedByDays(-7),
        value: 67,
        unit: QuantityUnit.bpm,
      },
      {
        date: this.startDateAdvancedByDays(-8),
        value: 80,
        unit: QuantityUnit.bpm,
      },
      {
        date: this.startDateAdvancedByDays(-9),
        value: 65,
        unit: QuantityUnit.bpm,
      },
    ]
  }

  async getBodyWeightObservations(
    userId: string,
    cutoffDate: Date,
    unit: QuantityUnit,
  ): Promise<Observation[]> {
    return [
      {
        date: this.startDateAdvancedByDays(-1),
        value: 269,
        unit: QuantityUnit.lbs,
      },
      {
        date: this.startDateAdvancedByDays(-2),
        value: 267,
        unit: QuantityUnit.lbs,
      },
      {
        date: this.startDateAdvancedByDays(-3),
        value: 267,
        unit: QuantityUnit.lbs,
      },
      {
        date: this.startDateAdvancedByDays(-4),
        value: 265,
        unit: QuantityUnit.lbs,
      },
      {
        date: this.startDateAdvancedByDays(-5),
        value: 268,
        unit: QuantityUnit.lbs,
      },
      {
        date: this.startDateAdvancedByDays(-6),
        value: 268,
        unit: QuantityUnit.lbs,
      },
      {
        date: this.startDateAdvancedByDays(-7),
        value: 266,
        unit: QuantityUnit.lbs,
      },
      {
        date: this.startDateAdvancedByDays(-8),
        value: 266,
        unit: QuantityUnit.lbs,
      },
      {
        date: this.startDateAdvancedByDays(-9),
        value: 267,
        unit: QuantityUnit.lbs,
      },
    ]
  }

  async getMostRecentDryWeightObservation(
    userId: string,
  ): Promise<Observation | undefined> {
    return {
      date: this.startDateAdvancedByDays(-4),
      value: 267.5,
      unit: QuantityUnit.lbs,
    }
  }

  async getMostRecentCreatinineObservation(
    userId: string,
  ): Promise<Observation | undefined> {
    return {
      date: this.startDateAdvancedByDays(-4),
      value: 1.1,
      unit: QuantityUnit.mg_dL,
    }
  }

  async getMostRecentPotassiumObservation(
    userId: string,
  ): Promise<Observation | undefined> {
    return {
      date: this.startDateAdvancedByDays(-4),
      value: 4.2,
      unit: QuantityUnit.mEq_L,
    }
  }

  async getMostRecentEstimatedGlomerularFiltrationRateObservation(
    userId: string,
  ): Promise<Observation | undefined> {
    return {
      date: this.startDateAdvancedByDays(-4),
      value: 60,
      unit: QuantityUnit.mL_min_173m2,
    }
  }

  // Helpers

  private startDateAdvancedByDays(days: number): Date {
    return advanceDateByDays(this.startDate, days)
  }
}
