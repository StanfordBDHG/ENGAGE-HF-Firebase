//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { type HealthSummaryData } from '../../models/healthSummaryData.js'
import { MedicationRecommendationCategory } from '../../models/medicationRecommendation.js'
import { QuantityUnit } from '../../services/fhir/quantityUnit.js'

export function mockHealthSummaryData(): HealthSummaryData {
  return {
    name: 'John Doe',
    dateOfBirth: new Date('1970-01-02'),
    clinicianName: 'Dr. XXX',
    nextAppointment: new Date('2024-02-03'),
    medications: [
      {
        name: 'Losartan (Cozaar)',
        dose: '25mg Daily',
        targetDose: '100mg Daily',
        potentialPositiveChange:
          'Switch to Sacubitril-Valsartan (More Effective Medication)',
        category: MedicationRecommendationCategory.improvementAvailable,
      },
      {
        name: 'Dapagliflozin (Farxiga)',
        dose: '10mg Daily',
        targetDose: '10mg Daily',
        potentialPositiveChange: 'Continue Dose',
        category: MedicationRecommendationCategory.targetDoseReached,
      },
      {
        name: 'Carvedilol (Coreg)',
        dose: 'Not Taking',
        targetDose: '25-50mg Twice Daily',
        potentialPositiveChange: 'Start Medication',
        category: MedicationRecommendationCategory.notStarted,
      },
    ],
    vitals: {
      systolicBloodPressure: [
        { date: new Date('2024-02-01'), value: 110, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-31'), value: 114, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-30'), value: 123, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-29'), value: 109, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-28'), value: 105, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-27'), value: 98, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-26'), value: 94, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-25'), value: 104, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-24'), value: 102, unit: QuantityUnit.mmHg },
      ],
      diastolicBloodPressure: [
        { date: new Date('2024-02-01'), value: 70, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-31'), value: 82, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-30'), value: 75, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-29'), value: 77, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-28'), value: 72, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-27'), value: 68, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-26'), value: 65, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-25'), value: 72, unit: QuantityUnit.mmHg },
        { date: new Date('2024-01-24'), value: 80, unit: QuantityUnit.mmHg },
      ],
      heartRate: [
        { date: new Date('2024-02-01'), value: 79, unit: QuantityUnit.bpm },
        { date: new Date('2024-01-31'), value: 62, unit: QuantityUnit.bpm },
        { date: new Date('2024-01-30'), value: 77, unit: QuantityUnit.bpm },
        { date: new Date('2024-01-29'), value: 63, unit: QuantityUnit.bpm },
        { date: new Date('2024-01-28'), value: 61, unit: QuantityUnit.bpm },
        { date: new Date('2024-01-27'), value: 70, unit: QuantityUnit.bpm },
        { date: new Date('2024-01-26'), value: 67, unit: QuantityUnit.bpm },
        { date: new Date('2024-01-25'), value: 80, unit: QuantityUnit.bpm },
        { date: new Date('2024-01-24'), value: 65, unit: QuantityUnit.bpm },
      ],
      bodyWeight: [
        { date: new Date('2024-02-01'), value: 269, unit: QuantityUnit.lbs },
        { date: new Date('2024-01-31'), value: 267, unit: QuantityUnit.lbs },
        { date: new Date('2024-01-30'), value: 267, unit: QuantityUnit.lbs },
        { date: new Date('2024-01-29'), value: 265, unit: QuantityUnit.lbs },
        { date: new Date('2024-01-28'), value: 268, unit: QuantityUnit.lbs },
        { date: new Date('2024-01-27'), value: 268, unit: QuantityUnit.lbs },
        { date: new Date('2024-01-26'), value: 266, unit: QuantityUnit.lbs },
        { date: new Date('2024-01-25'), value: 266, unit: QuantityUnit.lbs },
        { date: new Date('2024-01-24'), value: 267, unit: QuantityUnit.lbs },
      ],
      dryWeight: {
        date: new Date('2024-04-02'),
        value: 267.5,
        unit: QuantityUnit.lbs,
      },
      creatinine: {
        date: new Date('2024-04-02'),
        value: 1.1,
        unit: QuantityUnit.mg_dL,
      },
      potassium: {
        date: new Date('2024-04-02'),
        value: 4.2,
        unit: QuantityUnit.mEq_L,
      },
      estimatedGlomerularFiltrationRate: {
        date: new Date('2024-04-02'),
        value: 60,
        unit: QuantityUnit.mL_min_173m2,
      },
    },
    symptomScores: [
      {
        overallScore: 40,
        physicalLimitsScore: 50,
        socialLimitsScore: 38,
        qualityOfLifeScore: 20,
        specificSymptomsScore: 60,
        dizzinessScore: 50,
        date: new Date('2024-01-24'),
      },
      {
        overallScore: 60,
        physicalLimitsScore: 58,
        socialLimitsScore: 75,
        qualityOfLifeScore: 37,
        specificSymptomsScore: 72,
        dizzinessScore: 70,
        date: new Date('2024-01-15'),
      },
      {
        overallScore: 44,
        physicalLimitsScore: 50,
        socialLimitsScore: 41,
        qualityOfLifeScore: 25,
        specificSymptomsScore: 60,
        dizzinessScore: 50,
        date: new Date('2023-12-30'),
      },
      {
        overallScore: 75,
        physicalLimitsScore: 58,
        socialLimitsScore: 75,
        qualityOfLifeScore: 60,
        specificSymptomsScore: 80,
        dizzinessScore: 100,
        date: new Date('2023-12-15'),
      },
    ],
  }
}
