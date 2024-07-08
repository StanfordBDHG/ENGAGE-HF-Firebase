import {
  CodingSystem,
  FHIRExtensionUrl,
  LoincCode,
  ObservationUnitCode,
} from './codes.js'
import {
  type DatabaseDocument,
  type DatabaseService,
} from './database/databaseService.js'
import { type FhirService } from './fhirService.js'
import { type HealthSummaryData } from '../healthSummary/healthSummaryData.js'
import {
  MedicationOptimizationCategory,
  type MedicationOptimization,
} from '../healthSummary/medication.js'
import { type Vitals } from '../healthSummary/vitals.js'
import {
  type FHIRMedication,
  type FHIRMedicationRequest,
} from '../models/fhir/medication'
import { type FHIRObservation } from '../models/fhir/observation.js'
import { type KccqScore } from '../models/kccqScore.js'
import { type MedicationClass } from '../models/medicationClass.js'

interface FHIRMedicationRequestContext {
  request: FHIRMedicationRequest
  drug?: FHIRMedication
  medication?: FHIRMedication
  medicationClass?: MedicationClass
  medicationClassId?: string
}

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
    const [userRecord, user, nextAppointment, medications, kccqScores, vitals] =
      await Promise.all([
        this.databaseService.getUserRecord(userId),
        this.databaseService.getUser(userId),
        this.databaseService.getNextAppointment(userId),
        this.getMedications(userId),
        this.getKccqScores(userId),
        this.getVitals(userId),
      ])

    const clinician =
      user.content?.clinician ?
        await this.databaseService.getUserRecord(user.content.clinician)
      : undefined

    return {
      name: userRecord.displayName ?? '---',
      dateOfBirth: user.content?.dateOfBirth,
      clinicianName: clinician?.displayName ?? '---',
      nextAppointment: nextAppointment?.content?.start,
      medications: medications,
      vitals: vitals,
      symptomScores: kccqScores,
    }
  }

  // Methods - KCCQ Scores

  private async getKccqScores(userId: string): Promise<KccqScore[]> {
    return this.compactMapDocuments(this.databaseService.getKccqScores(userId))
  }

  // Methods - Medication Requests

  private async getMedications(
    userId: string,
  ): Promise<MedicationOptimization[]> {
    const [medicationRequests, medicationRecommendations] = await Promise.all([
      this.getMedicationRequestContexts(() =>
        this.databaseService.getMedicationRequests(userId),
      ),
      this.getMedicationRequestContexts(() =>
        this.databaseService.getMedicationRecommendations(userId),
      ),
    ])

    const result: MedicationOptimization[] = []
    for (const recommendation of medicationRecommendations) {
      const currentMedicationId =
        this.fhirService.extractCurrentMedicationRequestIdForRecommendation(
          recommendation.request,
        )
      if (!currentMedicationId) continue
      const currentMedication = medicationRequests.find(
        (request) => request.request.id === currentMedicationId,
      )
      if (!currentMedication)
        throw new Error(
          'Current medication not found. Recommendations might be out of sync.',
        )
      result.push(
        this.createMedicationOptimization(currentMedication, recommendation),
      )
    }
    return result
  }

  private createMedicationOptimization(
    request: FHIRMedicationRequestContext | undefined,
    recommendation: FHIRMedicationRequestContext | undefined,
  ): MedicationOptimization {
    const medication = request?.medication ?? recommendation?.medication
    if (!medication?.id) throw new Error('Medication not found')
    const currentDailyDose = this.fhirService.extractDailyDose(
      medication.id,
      request ? [request.request] : [],
    )
    const targetDailyDose = this.fhirService.extractTargetDailyDose(medication)
    if (!targetDailyDose) throw new Error('Target daily dose not found')
    const targetDoseString =
      Array.isArray(targetDailyDose) ?
        targetDailyDose.map((dose) => dose.toString() + 'mg').join(', ')
      : targetDailyDose.toString() + 'mg'

    const recommendationDailyDose = this.fhirService.extractDailyDose(
      medication.id,
      recommendation ? [recommendation.request] : [],
    )

    const category =
      request ? MedicationOptimizationCategory.notStarted
      : recommendationDailyDose === currentDailyDose ?
        MedicationOptimizationCategory.targetDoseReached
      : MedicationOptimizationCategory.improvementAvailable
    const name = this.fhirService.extractMedicationDisplayName(medication)
    return {
      name: name ?? '---',
      dose: currentDailyDose
        .flatMap((dose) =>
          dose.value ? [dose.value.toString() + (dose.unit ?? '')] : [],
        )
        .join(', '),
      targetDose: targetDoseString,
      potentialPositiveChange: (() => {
        switch (category) {
          case MedicationOptimizationCategory.improvementAvailable:
            return 'Uptitration'
          case MedicationOptimizationCategory.targetDoseReached:
            return 'Continue Dose'
          case MedicationOptimizationCategory.notStarted:
            return 'Start Medication'
        }
      })(),
      category: category,
    }
  }

  private async getMedicationRequestContexts(
    fetch: () => Promise<Array<DatabaseDocument<FHIRMedicationRequest>>>,
  ): Promise<FHIRMedicationRequestContext[]> {
    const requests = await this.compactMapDocuments(fetch())
    return this.compactMap(
      Promise.all(
        requests.map((request) => this.getMedicationRequestContext(request)),
      ),
    )
  }

  private async getMedicationRequestContext(
    request: FHIRMedicationRequest,
  ): Promise<FHIRMedicationRequestContext> {
    const context: FHIRMedicationRequestContext = { request: request }
    const drugReference = request.medicationReference?.reference
    if (!drugReference) return context
    const ids = this.extractIdsFromDrugReference(drugReference)
    if (!ids) return context
    const [medicationId, drugId] = ids
    context.drug = (
      await this.databaseService.getDrug(medicationId, drugId)
    ).content
    context.medication = (
      await this.databaseService.getMedication(medicationId)
    ).content
    if (!context.medication) return context
    context.medicationClassId = this.extractMedicationClassId(
      context.medication,
    )
    if (!context.medicationClassId) return context
    context.medicationClass = (
      await this.databaseService.getMedicationClass(context.medicationClassId)
    ).content
    return context
  }

  private extractMedicationClassId(
    medication: FHIRMedication,
  ): string | undefined {
    return medication.extension?.find(
      (extension) =>
        extension.url === FHIRExtensionUrl.medicationClass.toString(),
    )?.valueString
  }

  private extractIdsFromDrugReference(
    drugReference: string,
  ): [string, string] | undefined {
    const [medications, medicationId, drugs, drugId] = drugReference.split('/')
    if (medications !== 'medications' || drugs !== 'drugs') return undefined
    return [medicationId, drugId]
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
        unit: ObservationUnitCode.mmHg,
        component: {
          code: LoincCode.systolicBloodPressure,
          system: CodingSystem.loinc,
        },
      }),
      this.fhirService.extractObservationValues(observations, {
        code: LoincCode.bloodPressure,
        system: CodingSystem.loinc,
        unit: ObservationUnitCode.mmHg,
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
      unit: ObservationUnitCode.bpm,
    })
  }

  private async getBodyWeightObservations(userId: string) {
    const observations = await this.compactMapDocuments<FHIRObservation>(
      this.databaseService.getBodyWeightObservations(userId),
    )
    return this.fhirService.extractObservationValues(observations, {
      code: LoincCode.bodyWeight,
      system: CodingSystem.loinc,
      unit: ObservationUnitCode.kg,
      convert: (value, unit) =>
        unit === ObservationUnitCode.lbs.toString() ?
          this.convertLbsToKg(value)
        : undefined,
    })
  }

  // Helpers

  private convertLbsToKg(value: number): number {
    return value * 0.45359237
  }

  private convertKgToLbs(value: number): number {
    return value / 0.45359237
  }

  private async compactMapDocuments<T>(
    documents: Promise<Array<DatabaseDocument<T>>>,
  ): Promise<T[]> {
    return documents.then((documents) =>
      documents.flatMap((document) =>
        document.content ? [document.content] : [],
      ),
    )
  }

  private async compactMap<T>(
    documents: Promise<Array<T | undefined>>,
  ): Promise<T[]> {
    return documents.then((documents) =>
      documents.flatMap((value) => (value ? [value] : [])),
    )
  }
}
