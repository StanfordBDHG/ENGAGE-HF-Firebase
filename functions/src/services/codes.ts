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
  creatinine = '2160-0',
  estimatedGlomerularFiltrationRate = '98979-8',
  potassium = '6298-4',
}

export enum RxNormCode {}

export enum SnomedCtCode {}

export enum MedicationClassReference {
  betaBlockers = 'medicationClasses/0',
  sglt2inhibitors = 'medicationClasses/1',
  mineralocorticoidReceptorAntagonists = 'medicationClasses/2',
  angiotensinConvertingEnzymeInhibitors = 'medicationClasses/3',
  angiotensinReceptorBlockers = 'medicationClasses/4',
  angiotensinReceptorNeprilysinInhibitors = 'medicationClasses/5',
  diuretics = 'medicationClasses/6',
}

export enum MedicationReference {
  spironolactone = 'medications/54279',
  carvedilol = 'medications/20352',
  carvedilolPhosphate = 'medications/668310',
  eplerenone = 'medications/54280',
  dapagliflozin = 'medications/54281',
  empagliflozin = 'medications/54282',
  losartan = 'medications/203160',
  sacubitrilValsartan = 'medications/1656339',
  bisoprolol = 'medications/19484',
  furosemide = 'medications/4603',
  sotagliflozin = 'medications/2638675',
  perindopril = 'medications/54552',
}

export enum DrugReference {
  bisoprolol5 = 'medications/19484/drugs/854904',
  eplerenone25 = 'medications/54280/drugs/353386',
  furosemide20 = 'medications/4603/drugs/315970',
  sotagliflozin200 = 'medications/2638675/drugs/2638683',
  perindopril4 = 'medications/54552/drugs/854987',
  sacubitrilValsartan49_51 = 'medications/1656339/drugs/1656349',
}
