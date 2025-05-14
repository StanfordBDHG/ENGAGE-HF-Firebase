//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  CachingStrategy,
  fhirQuestionnaireResponseConverter,
  StaticDataComponent,
  UserObservationCollection,
  UserSex,
  UserType,
} from '@stanfordbdhg/engagehf-models'
import { onUserQuestionnaireResponseWritten } from '../../functions/onUserDocumentWritten'
import { describeWithEmulators } from '../../tests/functions/testEnvironment'
import { _defaultSeed } from '../../functions/defaultSeed'
import { _updateStaticData } from '../../functions/updateStaticData'
import { getServiceFactory } from '../factory/getServiceFactory'

describeWithEmulators('QuestionnaireResponseService', (env) => {
  it('should be able to extract the registration response from an Apple device', async () => {
    await _updateStaticData(getServiceFactory(), {
      only: Object.values(StaticDataComponent),
      cachingStrategy: CachingStrategy.expectCache,
    })

    const userId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
    })

    const ref = env.collections.userQuestionnaireResponses(userId).doc()
    await env.setWithTrigger(onUserQuestionnaireResponseWritten, {
      ref,
      data: fhirQuestionnaireResponseConverter.value.schema.parse(
        registrationResponseApple,
      ),
      params: {
        userId,
        questionnaireResponseId: ref.id,
      },
    })

    const userDoc = await env.collections.users.doc(userId).get()
    const userData = userDoc.data()
    expect(userData).toBeDefined()
    expect(userDoc.data()?.dateOfBirth).toBeDefined()
    expect(userDoc.data()?.sex).toBe(UserSex.female)

    const appointments = await env.collections.userAppointments(userId).get()
    expect(appointments.size).toBe(1)
    expect(appointments.docs[0].data().start.toDateString()).toBe(
      new Date('2025-05-14').toDateString(),
    )

    const medicationRequests = await env.collections
      .userMedicationRequests(userId)
      .get()
    expect(medicationRequests.size).toBe(2)

    const creatinineDocs = await env.collections
      .userObservations(userId, UserObservationCollection.creatinine)
      .get()
    expect(creatinineDocs.size).toBe(1)
    expect(creatinineDocs.docs[0].data().creatinine?.value).toBe(15)

    const egfrDocs = await env.collections
      .userObservations(userId, UserObservationCollection.eGfr)
      .get()
    expect(egfrDocs.size).toBe(0)

    const potassiumDocs = await env.collections
      .userObservations(userId, UserObservationCollection.potassium)
      .get()
    expect(potassiumDocs.size).toBe(1)
    expect(potassiumDocs.docs[0].data().potassium?.value).toBe(1.75)

    const dryWeightDocs = await env.collections
      .userObservations(userId, UserObservationCollection.dryWeight)
      .get()
    expect(dryWeightDocs.size).toBe(0)
  })
})

const registrationResponseApple = {
  authored: '2025-05-14T21:00:08.836575031+02:00',
  resourceType: 'QuestionnaireResponse',
  item: [
    { answer: [{ valueDate: '2025-05-14' }], linkId: 'dateOfBirth' },
    {
      answer: [
        {
          valueCoding: {
            system: 'engage-hf-sex',
            code: 'female',
            display: 'Female',
          },
        },
      ],
      linkId: 'sex',
    },
    { answer: [{ valueBoolean: true }], linkId: '2160-0.exists' },
    { answer: [{ valueDecimal: 15 }], linkId: '2160-0.value' },
    { answer: [{ valueDate: '2025-05-14' }], linkId: '2160-0.date' },
    { linkId: '98979-8.exists', answer: [{ valueBoolean: false }] },
    { linkId: '6298-4.exists', answer: [{ valueBoolean: true }] },
    { linkId: '6298-4.value', answer: [{ valueDecimal: 1.75 }] },
    { answer: [{ valueDate: '2025-05-14' }], linkId: '6298-4.date' },
    { answer: [{ valueBoolean: false }], linkId: '8340-2.exists' },
    { linkId: 'betablockers.exists', answer: [{ valueBoolean: false }] },
    { linkId: 'rasi.exists', answer: [{ valueBoolean: true }] },
    { linkId: 'rasi.frequency', answer: [{ valueDecimal: 2 }] },
    { linkId: 'rasi.quantity', answer: [{ valueDecimal: 1.5 }] },
    {
      answer: [
        {
          valueCoding: {
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: 'medications/69749/drugs/349201',
            display: 'Valsartan (Diovan)\n160 mg Oral Tablet',
          },
        },
      ],
      linkId: 'rasi.drug',
    },
    { linkId: 'mra.exists', answer: [{ valueBoolean: false }] },
    { linkId: 'sglt2i.exists', answer: [{ valueBoolean: true }] },
    { linkId: 'sglt2i.frequency', answer: [{ valueDecimal: 2 }] },
    { answer: [{ valueDecimal: 1.34 }], linkId: 'sglt2i.quantity' },
    {
      answer: [
        {
          valueCoding: {
            display: 'Bexagliflozin (Brenzavvy)\n20 mg Oral Tablet',
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: 'medications/2627044/drugs/2637859',
          },
        },
      ],
      linkId: 'sglt2i.drug',
    },
    { answer: [{ valueBoolean: false }], linkId: 'diuretics.exists' },
    { answer: [{ valueBoolean: true }], linkId: 'appointment.exists' },
    { linkId: 'appointment.date', answer: [{ valueDate: '2025-05-14' }] },
  ],
  id: 'D8083543-1DED-491E-9AEB-771E3FECB70C',
  questionnaire: 'http://spezi.health/fhir/questionnaire/engagehf-registration',
  status: 'completed',
}
