import { https } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'
import { generateHealthSummary } from '../healthSummary/generate.js'
import { MedicationOptimizationCategory } from '../healthSummary/medication.js'
import { CacheDatabaseService } from '../services/database/cacheDatabaseService.js'
import { FirestoreService } from '../services/database/firestoreService.js'
import { FhirService } from '../services/fhirService.js'
import { HealthSummaryService } from '../services/healthSummaryService.js'

interface ExportHealthSummaryInput {
  userId?: string
}

export const exportDefaultHealthSummaryFunction = onRequest((_, res) => {
  const result = generateHealthSummary({
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
        category: MedicationOptimizationCategory.improvementAvailable,
      },
      {
        name: 'Dapagliflozin (Farxiga)',
        dose: '10mg Daily',
        targetDose: '10mg Daily',
        potentialPositiveChange: 'Continue Dose',
        category: MedicationOptimizationCategory.targetDoseReached,
      },
      {
        name: 'Carvedilol (Coreg)',
        dose: 'Not Taking',
        targetDose: '25-50mg Twice Daily',
        potentialPositiveChange: 'Start Medication',
        category: MedicationOptimizationCategory.notStarted,
      },
    ],
    vitals: {
      systolicBloodPressure: [
        { date: new Date('2024-02-01'), value: 110 },
        { date: new Date('2024-01-31'), value: 114 },
        { date: new Date('2024-01-30'), value: 123 },
        { date: new Date('2024-01-29'), value: 109 },
        { date: new Date('2024-01-28'), value: 105 },
        { date: new Date('2024-01-27'), value: 98 },
        { date: new Date('2024-01-26'), value: 94 },
        { date: new Date('2024-01-25'), value: 104 },
        { date: new Date('2024-01-24'), value: 102 },
      ],
      diastolicBloodPressure: [
        { date: new Date('2024-02-01'), value: 70 },
        { date: new Date('2024-01-31'), value: 82 },
        { date: new Date('2024-01-30'), value: 75 },
        { date: new Date('2024-01-29'), value: 77 },
        { date: new Date('2024-01-28'), value: 72 },
        { date: new Date('2024-01-27'), value: 68 },
        { date: new Date('2024-01-26'), value: 65 },
        { date: new Date('2024-01-25'), value: 72 },
        { date: new Date('2024-01-24'), value: 80 },
      ],
      heartRate: [
        { date: new Date('2024-02-01'), value: 79 },
        { date: new Date('2024-01-31'), value: 62 },
        { date: new Date('2024-01-30'), value: 77 },
        { date: new Date('2024-01-29'), value: 63 },
        { date: new Date('2024-01-28'), value: 61 },
        { date: new Date('2024-01-27'), value: 70 },
        { date: new Date('2024-01-26'), value: 67 },
        { date: new Date('2024-01-25'), value: 80 },
        { date: new Date('2024-01-24'), value: 65 },
      ],
      bodyWeight: [
        { date: new Date('2024-02-01'), value: 269 },
        { date: new Date('2024-01-31'), value: 267 },
        { date: new Date('2024-01-30'), value: 267 },
        { date: new Date('2024-01-29'), value: 265 },
        { date: new Date('2024-01-28'), value: 268 },
        { date: new Date('2024-01-27'), value: 268 },
        { date: new Date('2024-01-26'), value: 266 },
        { date: new Date('2024-01-25'), value: 266 },
        { date: new Date('2024-01-24'), value: 267 },
      ],
      dryWeight: 267.5,
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
  })
  res.write(result, 'utf8')
  res.end()
})

export const exportHealthSummaryFunction = onRequest(async (req, res) => {
  const body = req.body as ExportHealthSummaryInput | undefined
  if (!body?.userId)
    throw new https.HttpsError('invalid-argument', 'User ID is required')

  const service = new HealthSummaryService(
    new FhirService(),
    new CacheDatabaseService(new FirestoreService()),
  )
  const data = await service.fetchHealthSummaryData(body.userId)
  const result = generateHealthSummary(data)
  res.write(result, 'utf8')
  res.end()
})
