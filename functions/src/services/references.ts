//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

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
  spironolactone = 'medications/9997',
  carvedilol = 'medications/20352',
  carvedilolPhosphate = 'medications/668310',
  eplerenone = 'medications/298869',
  dapagliflozin = 'medications/1488564',
  empagliflozin = 'medications/1545653',
  losartan = 'medications/203160',
  sacubitrilValsartan = 'medications/1656339',
  bisoprolol = 'medications/19484',
  furosemide = 'medications/4603',
  sotagliflozin = 'medications/2638675',
  perindopril = 'medications/54552',
  lisinopril = 'medications/29046',
  valsartan = 'medications/69749',
  metoprololSuccinate = 'medications/221124',
}

export enum DrugReference {
  carvedilol3_125 = 'medications/20352/drugs/686924',
  carvedilol25 = 'medications/20352/drugs/200033',
  bisoprolol5 = 'medications/19484/drugs/854905',
  dapagliflozin5 = 'medications/1488564/drugs/1488574',
  lisinopril5 = 'medications/29046/drugs/311354',
  empagliflozin10 = 'medications/1545653/drugs/1545658',
  eplerenone25 = 'medications/298869/drugs/351256',
  furosemide20 = 'medications/4603/drugs/310429',
  sotagliflozin200 = 'medications/2638675/drugs/2638683',
  spironolactone25 = 'medications/9997/drugs/313096',
  losartan25 = 'medications/203160/drugs/979485',
  losartan100 = 'medications/203160/drugs/979480',
  perindopril4 = 'medications/54552/drugs/854988',
  sacubitrilValsartan24_26 = 'medications/1656339/drugs/1656340',
  sacubitrilValsartan49_51 = 'medications/1656339/drugs/1656349',
  sacubitrilValsartan97_103 = 'medications/1656339/drugs/1656354',
  metoprololSuccinate25Tablet = 'medications/221124/drugs/866427',
}

export enum QuestionnaireReference {
  enUS = 'questionnaires/0',
}

export enum VideoReference {
  welcome = 'videoSections/0/videos/0',
  betaBlockers = 'videoSections/1/videos/1',
  aceiAndArbs = 'videoSections/1/videos/2',
  angiotensinReceptorNeprilysinInhibitors = 'videoSections/1/videos/3',
  mineralocorticoidReceptorAntagonists = 'videoSections/1/videos/4',
  sglt2inhibitors = 'videoSections/1/videos/5',
  diuretics = 'videoSections/1/videos/6',
}
