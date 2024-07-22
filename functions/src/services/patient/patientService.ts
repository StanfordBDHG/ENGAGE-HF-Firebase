import { type FHIRAllergyIntolerance } from '../../models/fhir/allergyIntolerance.js'
import { type FHIRAppointment } from '../../models/fhir/appointment.js'
import { type FHIRMedicationRequest } from '../../models/fhir/medication.js'
import { type FHIRObservation } from '../../models/fhir/observation.js'
import { type FHIRQuestionnaireResponse } from '../../models/fhir/questionnaireResponse.js'
import { type MedicationRecommendation } from '../../models/medicationRecommendation.js'
import { type SymptomScore } from '../../models/symptomScore.js'
import { type DatabaseDocument } from '../database/databaseService.js'

export interface PatientService {
  // Appointments

  getAppointments(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRAppointment>>>
  getNextAppointment(
    userId: string,
  ): Promise<DatabaseDocument<FHIRAppointment> | undefined>

  // AllergyIntolerances

  getAllergyIntolerances(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRAllergyIntolerance>>>

  // Medication Requests

  getMedicationRecommendations(
    userId: string,
  ): Promise<Array<DatabaseDocument<MedicationRecommendation>>>
  getMedicationRequests(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRMedicationRequest>>>

  // Observations

  getBloodPressureObservations(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRObservation>>>
  getBodyWeightObservations(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRObservation>>>
  getHeartRateObservations(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRObservation>>>

  // Questionnaire Responses

  getQuestionnaireResponses(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRQuestionnaireResponse>>>
  getSymptomScores(
    userId: string,
  ): Promise<Array<DatabaseDocument<SymptomScore>>>
}
