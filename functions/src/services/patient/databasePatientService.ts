import { type PatientService } from './patientService.js'
import { type FHIRAllergyIntolerance } from '../../models/fhir/allergyIntolerance.js'
import { type FHIRAppointment } from '../../models/fhir/appointment.js'
import { type FHIRMedicationRequest } from '../../models/fhir/medication.js'
import { type FHIRObservation } from '../../models/fhir/observation.js'
import { type FHIRQuestionnaireResponse } from '../../models/fhir/questionnaireResponse.js'
import { type MedicationRecommendation } from '../../models/medicationRecommendation.js'
import { type SymptomScore } from '../../models/symptomScore.js'
import {
  type DatabaseDocument,
  type DatabaseService,
} from '../database/databaseService.js'

export class DatabasePatientService implements PatientService {
  // Properties

  private databaseService: DatabaseService

  // Constructor

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService
  }

  // Methods - Appointments

  async getAppointments(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRAppointment>>> {
    return this.databaseService.getCollection<FHIRAppointment>(
      `patients/${userId}/appointments`,
    )
  }

  async getNextAppointment(
    userId: string,
  ): Promise<DatabaseDocument<FHIRAppointment> | undefined> {
    const result = await this.databaseService.getQuery<FHIRAppointment>(
      (firestore) =>
        firestore
          .collection(`patients/${userId}/appointments`)
          .where('start', '>', new Date())
          .orderBy('start', 'asc')
          .limit(1),
    )
    return result.at(0)
  }

  // Methods - AllergyIntolerances

  async getAllergyIntolerances(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRAllergyIntolerance>>> {
    return this.databaseService.getCollection<FHIRAllergyIntolerance>(
      `patients/${userId}/allergyIntolerances`,
    )
  }

  // Methods - Medication Requests

  async getMedicationRecommendations(
    userId: string,
  ): Promise<Array<DatabaseDocument<MedicationRecommendation>>> {
    return this.databaseService.getCollection<MedicationRecommendation>(
      `patients/${userId}/medicationRecommendations`,
    )
  }

  async getMedicationRequests(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRMedicationRequest>>> {
    return this.databaseService.getCollection<FHIRMedicationRequest>(
      `patients/${userId}/medicationRequests`,
    )
  }

  // Methods - Observations

  async getBloodPressureObservations(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRObservation>>> {
    return this.databaseService.getCollection<FHIRObservation>(
      `patients/${userId}/bloodPressureObservations`,
    )
  }

  async getBodyWeightObservations(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRObservation>>> {
    return this.databaseService.getCollection<FHIRObservation>(
      `patients/${userId}/bodyWeightObservations`,
    )
  }

  async getHeartRateObservations(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRObservation>>> {
    return this.databaseService.getCollection<FHIRObservation>(
      `patients/${userId}/heartRateObservations`,
    )
  }

  // Methods - Questionnaire Responses

  async getQuestionnaireResponses(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRQuestionnaireResponse>>> {
    return this.databaseService.getCollection<FHIRQuestionnaireResponse>(
      `patients/${userId}/questionnaireResponses`,
    )
  }

  async getSymptomScores(
    userId: string,
  ): Promise<Array<DatabaseDocument<SymptomScore>>> {
    return this.databaseService.getCollection<SymptomScore>(
      `patients/${userId}/symptomScores`,
    )
  }
}
