//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
export enum FHIRExtensionUrl {
  medicationClass = 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
  minimumDailyDose = 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
  targetDailyDose = 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
  currentMedication = 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/MedicationRequest/extension/currentMedication',
}

export enum CodingSystem {
  loinc = 'http://loinc.org',
  rxNorm = 'http://www.nlm.nih.gov/research/umls/rxnorm',
  snomedCt = 'http://snomed.info/sct',
}

export enum LoincCode {
  bloodPressure = '85354-9',
  systolicBloodPressure = '8480-6',
  diastolicBloodPressure = '8462-4',
  bodyWeight = '29463-7',
  heartRate = '8867-4',
}

export enum RxNormCode {}

export enum SnomedCtCode {}
