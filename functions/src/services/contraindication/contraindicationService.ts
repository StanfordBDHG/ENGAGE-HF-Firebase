import { type FHIRAllergyIntolerance } from '../../models/fhir/allergyIntolerance.js'
import {
  type MedicationClassReference,
  type MedicationReference,
} from '../codes.js'

export enum ContraindicationCategory {
  none,
  clinicianListed,
  allergyIntolerance,
  severeAllergyIntolerance,
}

export interface ContraindicationService {
  // Methods

  checkMedication(
    contraindications: FHIRAllergyIntolerance[],
    medicationReference: MedicationReference,
  ): ContraindicationCategory

  checkMedicationClass(
    contraindications: FHIRAllergyIntolerance[],
    medicationClassReference: MedicationClassReference,
  ): ContraindicationCategory
}
