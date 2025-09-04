//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  MedicationClassReference,
  MedicationReference,
  type FHIRMedication,
  type FHIRMedicationRequest,
  type MedicationClass,
} from '@stanfordbdhg/engagehf-models'
import { type Reference } from 'fhir/r4b.js'

export interface MedicationRequestContext {
  lastUpdate: Date
  request: FHIRMedicationRequest
  requestReference: Reference
  drug: FHIRMedication
  drugReference: Reference
  medication: FHIRMedication
  medicationReference: Reference
  medicationClass: MedicationClass
  medicationClassReference: Reference
}

export function medicationClassReference(
  medicationReference: MedicationReference,
): MedicationClassReference {
  switch (medicationReference) {
    case MedicationReference.metoprololSuccinate:
    case MedicationReference.carvedilol:
    case MedicationReference.carvedilolPhosphate:
    case MedicationReference.bisoprolol:
      return MedicationClassReference.betaBlockers;

    case MedicationReference.dapagliflozin:
    case MedicationReference.empagliflozin:
    case MedicationReference.sotagliflozin:
    case MedicationReference.bexagliflozin:
    case MedicationReference.canagliflozin:
    case MedicationReference.ertugliflozin:
      return MedicationClassReference.sglt2inhibitors;

    case MedicationReference.spironolactone:
    case MedicationReference.eplerenone:
      return MedicationClassReference.mineralocorticoidReceptorAntagonists;

    case MedicationReference.quinapril:
    case MedicationReference.perindopril:
    case MedicationReference.ramipril:
    case MedicationReference.benazepril:
    case MedicationReference.captopril:
    case MedicationReference.enalapril:
    case MedicationReference.lisinopril:
    case MedicationReference.fosinopril:
    case MedicationReference.trandolapril:
    case MedicationReference.moexepril:
      return MedicationClassReference.angiotensinConvertingEnzymeInhibitors;

    case MedicationReference.losartan:
    case MedicationReference.valsartan:
    case MedicationReference.candesartan:
    case MedicationReference.irbesartan:
    case MedicationReference.telmisartan:
    case MedicationReference.olmesartan:
    case MedicationReference.azilsartan:
    case MedicationReference.eprosartan:
      return MedicationClassReference.angiotensinReceptorBlockers;

    case MedicationReference.sacubitrilValsartan:
      return MedicationClassReference.angiotensinReceptorNeprilysinInhibitors;

    case MedicationReference.furosemide:
    case MedicationReference.bumetanide:
    case MedicationReference.torsemide:
    case MedicationReference.ethacrynicAcid:
      return MedicationClassReference.diuretics;
  }
}
