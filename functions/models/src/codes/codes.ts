//
// This source file is part of the ENGAGE-HF Firebase open-source project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

export enum FHIRExtensionUrl {
  brandName = "https://www.engage-hf.com/fhir/StructureDefinition/Medication/extension/brandName",
  medicationClass = "https://www.engage-hf.com/fhir/StructureDefinition/Medication/extension/medicationClass",
  minimumDailyDose = "https://www.engage-hf.com/fhir/StructureDefinition/Medication/extension/minimumDailyDose",
  questionnaireItemControl = "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
  targetDailyDose = "https://www.engage-hf.com/fhir/StructureDefinition/Medication/extension/targetDailyDose",
  totalDailyDose = "https://www.engage-hf.com/fhir/StructureDefinition/MedicationRequest/extension/totalDailyDose",
  providerName = "https://www.engage-hf.com/fhir/StructureDefinition/Appointment/extension/providerName",
}

export enum CodingSystem {
  loinc = "http://loinc.org",
  rxNorm = "http://www.nlm.nih.gov/research/umls/rxnorm",
  snomedCt = "http://snomed.info/sct",
  questionnaireItemControl = "http://hl7.org/fhir/questionnaire-item-control",
}

export enum LoincCode {
  bloodPressure = "85354-9",
  systolicBloodPressure = "8480-6",
  diastolicBloodPressure = "8462-4",
  bodyWeight = "29463-7",
  dryWeight = "8340-2",
  heartRate = "8867-4",
  creatinine = "2160-0",
  estimatedGlomerularFiltrationRate = "98979-8",
  potassium = "6298-4",
}
