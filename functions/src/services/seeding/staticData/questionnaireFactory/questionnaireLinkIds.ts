//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  MedicationClassReference,
  type LoincCode,
} from '@stanfordbdhg/engagehf-models'

export enum MedicationGroup {
  betaBlockers = 'betablockers',
  rasi = 'rasi',
  mra = 'mra',
  sglt2i = 'sglt2i',
  diuretics = 'diuretics',
}

export function medicationClassesForGroup(
  group: MedicationGroup,
): MedicationClassReference[] {
  switch (group) {
    case MedicationGroup.betaBlockers:
      return [MedicationClassReference.betaBlockers]
    case MedicationGroup.rasi:
      return [
        MedicationClassReference.angiotensinReceptorNeprilysinInhibitors,
        MedicationClassReference.angiotensinConvertingEnzymeInhibitors,
        MedicationClassReference.angiotensinReceptorBlockers,
      ]
    case MedicationGroup.mra:
      return [MedicationClassReference.mineralocorticoidReceptorAntagonists]
    case MedicationGroup.sglt2i:
      return [MedicationClassReference.sglt2inhibitors]
    case MedicationGroup.diuretics:
      return [MedicationClassReference.diuretics]
  }
}

export enum QuestionnaireId {
  kccq = '9528ccc2-d1be-4c4c-9c3c-19f78e51ec19',
  dataUpdate = 'engagehf-data-update',
  postVisit = 'engagehf-post-visit',
  registration = 'engagehf-registration',
}

export const QuestionnaireLinkId = {
  url(id: QuestionnaireId) {
    return `http://spezi.health/fhir/questionnaire/${id}`
  },

  appointment: {
    page0: 'appointment.exists',
    existsDescription: 'appointment.exists-description',
    exists: 'appointment.exists',

    page1: 'appointment.page1',
    description: 'appointment.description',
    date: 'appointment.date',
  },

  personalInformation: {
    page: 'personal-information',
    description: 'personal-information.description',
    dateOfBirth: 'dateOfBirth',
    sex: 'sex',
  },

  labValue(loincCode: LoincCode) {
    return {
      page0: `${loincCode}.exists`,
      existsDescription: `${loincCode}.exists-description`,
      exists: `${loincCode}.exists`,

      page1: `${loincCode}.page1`,
      description: `${loincCode}.description`,
      number: `${loincCode}.value`,
      date: `${loincCode}.date`,
    }
  },

  medication(medicationGroup: MedicationGroup) {
    return {
      page0: `${medicationGroup}.exists`,
      existsDescription: `${medicationGroup}.exists-description`,
      exists: `${medicationGroup}.exists`,

      page1: `${medicationGroup}.page1`,
      description: `${medicationGroup}.description`,
      drug: `${medicationGroup}.drug`,
      quantity: `${medicationGroup}.quantity`,
      frequency: `${medicationGroup}.frequency`,
    }
  },

  kccq: {
    introduction: '73490535-203f-44b2-d1b7-7c0a786c16f9',
    question1: 'c0b3bef6-1e2d-4621-d82e-b73069574dc4',
    question1a: 'a459b804-35bf-4792-f1eb-0b52c4e176e1',
    question1b: 'cf9c5031-1ed5-438a-fc7d-dc69234015a0',
    question1c: '1fad0f81-b2a9-4c8f-9a78-4b2a5d7aef07',
    question2: '692bda7d-a616-43d1-8dc6-8291f6460ab2',
    question3: 'b1734b9e-1d16-4238-8556-5ae3fa0ba913',
    question4: '57f37fb3-a0ad-4b1f-844e-3f67d9b76946',
    question5: '396164df-d045-4c56-d710-513297bdc6f2',
    question6: '75e3f62e-e37d-48a2-f4d9-af2db8922da0',
    question7: 'fce3a16e-c6d8-4bac-8ab5-8f4aee4adc08',
    question8: '8649bc8c-f908-487d-87a4-a97106b1a4c3',
    question8a: '8b022e69-127d-4447-8190-39ac645e60e1',
    question8b: '1eee7259-da1c-4cba-80a9-e67e684573a1',
    question8c: '883a22a8-2f6e-4b41-84b7-0028ed543192',
    question9: '24108967-2ff3-40d0-c54f-a7b97bb84d05',
  },
} as const
