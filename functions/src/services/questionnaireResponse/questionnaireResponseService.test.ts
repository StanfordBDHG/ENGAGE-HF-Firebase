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
  QuantityUnit,
} from '@stanfordbdhg/engagehf-models'
import { _defaultSeed } from '../../functions/defaultSeed.js'
import { onUserQuestionnaireResponseWritten } from '../../functions/onUserDocumentWritten.js'
import { _updateStaticData } from '../../functions/updateStaticData.js'
import { describeWithEmulators } from '../../tests/functions/testEnvironment.js'
import { getServiceFactory } from '../factory/getServiceFactory.js'
import { median } from 'd3'

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

    const medicationRequestsData = medicationRequests.docs.map((doc) =>
      doc.data(),
    )

    const valsartan = medicationRequestsData.find(
      (req) =>
        req.medicationReference?.reference === 'medications/69749/drugs/349201',
    )
    expect(valsartan).toBeDefined()
    expect(valsartan?.dosageInstruction?.length).toBe(1)
    const valsartanDosageInstruction = valsartan?.dosageInstruction?.at(0)
    expect(valsartanDosageInstruction?.timing?.repeat?.frequency).toBe(2)
    expect(valsartanDosageInstruction?.doseAndRate?.length).toBe(1)
    const valsartanDoseAndRate = valsartanDosageInstruction?.doseAndRate?.at(0)
    expect(valsartanDoseAndRate?.doseQuantity?.value).toBe(1.5)

    const bexagliflozin = medicationRequestsData.find(
      (req) =>
        req.medicationReference?.reference ===
        'medications/2627044/drugs/2637859',
    )
    expect(bexagliflozin).toBeDefined()
    expect(bexagliflozin?.dosageInstruction?.length).toBe(1)
    const bexagliflozinDosageInstruction =
      bexagliflozin?.dosageInstruction?.at(0)
    expect(bexagliflozinDosageInstruction?.timing?.repeat?.frequency).toBe(2)
    expect(bexagliflozinDosageInstruction?.doseAndRate?.length).toBe(1)
    const bexagliflozinDoseAndRate =
      bexagliflozinDosageInstruction?.doseAndRate?.at(0)
    expect(bexagliflozinDoseAndRate?.doseQuantity?.value).toBe(1.34)

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

  it('should be able to extract the registration response from an Android device', async () => {
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
        registrationResponseAndroid,
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
    expect(userDoc.data()?.sex).toBe(UserSex.male)

    const appointments = await env.collections.userAppointments(userId).get()
    expect(appointments.size).toBe(1)
    expect(appointments.docs[0].data().start.toDateString()).toBe(
      new Date('2025-07-12').toDateString(),
    )

    const medicationRequests = await env.collections
      .userMedicationRequests(userId)
      .get()
    expect(medicationRequests.size).toBe(2)
    const medicationRequestsData = medicationRequests.docs.map((doc) =>
      doc.data(),
    )

    const benazepril = medicationRequestsData.find(
      (req) =>
        req.medicationReference?.reference === 'medications/18867/drugs/898719',
    )
    expect(benazepril).toBeDefined()
    expect(benazepril?.dosageInstruction?.length).toBe(1)
    const benazeprilDosageInstruction = benazepril?.dosageInstruction?.at(0)
    expect(benazeprilDosageInstruction?.timing?.repeat?.frequency).toBe(2.3)
    expect(benazeprilDosageInstruction?.doseAndRate?.length).toBe(1)
    const benazeprilDoseAndRate =
      benazeprilDosageInstruction?.doseAndRate?.at(0)
    expect(benazeprilDoseAndRate?.doseQuantity?.value).toBe(0.5)

    const empagliflozin = medicationRequestsData.find(
      (req) =>
        req.medicationReference?.reference ===
        'medications/1545653/drugs/1545658',
    )
    expect(empagliflozin).toBeDefined()
    expect(empagliflozin?.dosageInstruction?.length).toBe(1)
    const empagliflozinDosageInstruction =
      empagliflozin?.dosageInstruction?.at(0)
    expect(empagliflozinDosageInstruction?.timing?.repeat?.frequency).toBe(3)
    expect(empagliflozinDosageInstruction?.doseAndRate?.length).toBe(1)
    const empagliflozinDoseAndRate =
      empagliflozinDosageInstruction?.doseAndRate?.at(0)
    expect(empagliflozinDoseAndRate?.doseQuantity?.value).toBe(1)

    const creatinineDocs = await env.collections
      .userObservations(userId, UserObservationCollection.creatinine)
      .get()
    expect(creatinineDocs.size).toBe(1)
    expect(creatinineDocs.docs[0].data().creatinine?.value).toBe(4.5)

    const egfrDocs = await env.collections
      .userObservations(userId, UserObservationCollection.eGfr)
      .get()
    expect(egfrDocs.size).toBe(1)
    expect(
      egfrDocs.docs[0].data().estimatedGlomerularFiltrationRate?.value,
    ).toBe(55)

    const potassiumDocs = await env.collections
      .userObservations(userId, UserObservationCollection.potassium)
      .get()
    expect(potassiumDocs.size).toBe(0)

    const dryWeightDocs = await env.collections
      .userObservations(userId, UserObservationCollection.dryWeight)
      .get()
    expect(dryWeightDocs.size).toBe(1)
    expect(
      dryWeightDocs.docs[0].data().dryWeight(QuantityUnit.lbs)?.value,
    ).toBe(150)
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

const registrationResponseAndroid = {
  resourceType: 'QuestionnaireResponse',
  questionnaire: 'http://spezi.health/fhir/questionnaire/engagehf-registration',
  item: [
    {
      linkId: 'de981575-bd5b-4d84-95bb-35ed6c7f5923',
      text: 'Welcome to the ENGAGE-HF study! Please complete the following survey to help us understand your health and well-being.',
    },
    {
      linkId: 'personal-information',
      text: 'Personal information',
      item: [
        {
          linkId: 'personal-information.description',
          text: 'Please provide the following information to help us understand your health and well-being.',
        },
        {
          linkId: 'dateOfBirth',
          text: 'Date of Birth',
          answer: [
            {
              valueDate: '2024-10-21',
            },
          ],
        },
        {
          linkId: 'sex',
          text: 'Select your sex:',
          answer: [
            {
              valueCoding: {
                id: 'male',
                system: 'engage-hf-sex',
                code: 'male',
                display: 'Male',
              },
            },
          ],
        },
      ],
    },
    {
      linkId: '2160-0.exists',
      text: 'Creatinine',
      item: [
        {
          linkId: '2160-0.exists-description',
          text: 'The creatinine level in your body helps understand how your liver handles the drugs you are taking.',
        },
        {
          linkId: '2160-0.exists',
          text: 'Have you recently received a new creatinine value?',
          answer: [
            {
              valueBoolean: true,
            },
          ],
        },
      ],
    },
    {
      linkId: '2160-0.page1',
      text: 'Creatinine',
      item: [
        {
          linkId: '2160-0.description',
          text: 'The creatinine level in your body helps understand how your liver handles the drugs you are taking.',
        },
        {
          linkId: '2160-0.value',
          text: 'Creatinine (mg/dL):',
          answer: [
            {
              valueDecimal: 4.5,
            },
          ],
        },
        {
          linkId: '2160-0.date',
          text: 'Date:',
          answer: [
            {
              valueDate: '2024-10-12',
            },
          ],
        },
      ],
    },
    {
      linkId: '98979-8.exists',
      text: 'eGFR',
      item: [
        {
          linkId: '98979-8.exists-description',
          text: 'eGFR (estimated Glomerular Filtration Rate) is a test that estimates how well your kidneys are filtering blood.',
        },
        {
          linkId: '98979-8.exists',
          text: 'Have you recently received a new eGFR value?',
          answer: [
            {
              valueBoolean: true,
            },
          ],
        },
      ],
    },
    {
      linkId: '98979-8.page1',
      text: 'eGFR',
      item: [
        {
          linkId: '98979-8.description',
          text: 'eGFR (estimated Glomerular Filtration Rate) is a test that estimates how well your kidneys are filtering blood.',
        },
        {
          linkId: '98979-8.value',
          text: 'eGFR (mL/min/1.73m2):',
          answer: [
            {
              valueDecimal: 55.0,
            },
          ],
        },
        {
          linkId: '98979-8.date',
          text: 'Date:',
          answer: [
            {
              valueDate: '2025-05-23',
            },
          ],
        },
      ],
    },
    {
      linkId: '6298-4.exists',
      text: 'Potassium',
      item: [
        {
          linkId: '6298-4.exists-description',
          text: 'The potassium level in your body helps understand how your liver handles the drugs you are taking.',
        },
        {
          linkId: '6298-4.exists',
          text: 'Have you recently received a new potassium value?',
          answer: [
            {
              valueBoolean: false,
            },
          ],
        },
      ],
    },
    {
      linkId: '8340-2.exists',
      text: 'Dry Weight',
      item: [
        {
          linkId: '8340-2.exists-description',
          text: 'The dry weight is useful to set a baseline to check that your weight does not increase unnoticed.',
        },
        {
          linkId: '8340-2.exists',
          text: 'Have you recently received a new dry weight value?',
          answer: [
            {
              valueBoolean: true,
            },
          ],
        },
      ],
    },
    {
      linkId: '8340-2.page1',
      text: 'Dry Weight',
      item: [
        {
          linkId: '8340-2.description',
          text: 'The dry weight is useful to set a baseline to check that your weight does not increase unnoticed.',
        },
        {
          linkId: '8340-2.value',
          text: 'Dry Weight (lbs):',
          answer: [
            {
              valueDecimal: 150.0,
            },
          ],
        },
        {
          linkId: '8340-2.date',
          text: 'Date:',
          answer: [
            {
              valueDate: '2025-04-03',
            },
          ],
        },
      ],
    },
    {
      linkId: 'betablockers.exists',
      text: 'Beta Blockers',
      item: [
        {
          linkId: 'betablockers.exists-description',
          text: 'Do you take any of the following medications? Bisoprolol (Zebeta) Carvedilol (Coreg) Metoprolol Succinate (Toprol XL) Carvedilol Phosphate (Coreg CR)',
        },
        {
          linkId: 'betablockers.exists',
          text: 'Do you take any medication from the above list?',
          answer: [
            {
              valueBoolean: false,
            },
          ],
        },
      ],
    },
    {
      linkId: 'rasi.exists',
      text: 'Renin-Angiotensin System Inhibitors (RASI)',
      item: [
        {
          linkId: 'rasi.exists-description',
          text: 'Do you take any of the following medications? Captopril (Capoten) Enalapril (Vasotec) Benazepril (Lotensin) Lisinopril (Zestril) Moexipril (Univasc) Quinapril (Accupril) Ramipril (Altace) Trandolapril (Mavik) Perindopril (Aceon) Valsartan (Diovan) Telmisartan (Micardis) Eprosartan (Teveten) Irbesartan (Avapro) Olmesartan Medoxomil (Benicar) Losartan Potassium (Cozaar) Candesartan (Atacand) Fosinopril Sodium (Monopril) Azilsartan Medoxomil (Edarbi)',
        },
        {
          linkId: 'rasi.exists',
          text: 'Do you take any medication from the above list?',
          answer: [
            {
              valueBoolean: true,
            },
          ],
        },
      ],
    },
    {
      linkId: 'rasi.page1',
      text: 'Renin-Angiotensin System Inhibitors (RASI)',
      item: [
        {
          linkId: 'rasi.description',
          text: 'Please enter which drug you are taking, how often you take it per day and how many pills/tablets you take per intake. Do not enter the total amount of pills/tablets you take per day.',
        },
        {
          linkId: 'rasi.frequency',
          text: 'Intake frequency (per day):',
          answer: [
            {
              valueDecimal: 2.3,
            },
          ],
        },
        {
          linkId: 'rasi.quantity',
          text: 'Pills/tablets per intake:',
          answer: [
            {
              valueDecimal: 0.5,
            },
          ],
        },
        {
          linkId: 'rasi.drug',
          text: 'Which pill/tablet do you take?',
          answer: [
            {
              valueCoding: {
                id: 'medications/18867/drugs/898719',
                system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                code: 'medications/18867/drugs/898719',
                display: 'Benazepril (Lotensin)\n40 mg Oral Tablet',
              },
            },
          ],
        },
      ],
    },
    {
      linkId: 'mra.exists',
      text: 'Mineralocorticoid Receptor Antagonists (MRA)',
      item: [
        {
          linkId: 'mra.exists-description',
          text: 'Do you take any of the following medications? Spironolactone (Aldactone) Eplerenone (Inspra)',
        },
        {
          linkId: 'mra.exists',
          text: 'Do you take any medication from the above list?',
          answer: [
            {
              valueBoolean: false,
            },
          ],
        },
      ],
    },
    {
      linkId: 'sglt2i.exists',
      text: 'SGLT2 Inhibitors (SGLT2i)',
      item: [
        {
          linkId: 'sglt2i.exists-description',
          text: 'Do you take any of the following medications? Canagliflozin (Invokana) Dapagliflozin (Farxiga) Empagliflozin (Jardiance) Ertugliflozin (Steglatro) Bexagliflozin (Brenzavvy) Sotagliflozin (Inpefa)',
        },
        {
          linkId: 'sglt2i.exists',
          text: 'Do you take any medication from the above list?',
          answer: [
            {
              valueBoolean: true,
            },
          ],
        },
      ],
    },
    {
      linkId: 'sglt2i.page1',
      text: 'SGLT2 Inhibitors (SGLT2i)',
      item: [
        {
          linkId: 'sglt2i.description',
          text: 'Please enter which drug you are taking, how often you take it per day and how many pills/tablets you take per intake. Do not enter the total amount of pills/tablets you take per day.',
        },
        {
          linkId: 'sglt2i.frequency',
          text: 'Intake frequency (per day):',
          answer: [
            {
              valueDecimal: 3.0,
            },
          ],
        },
        {
          linkId: 'sglt2i.quantity',
          text: 'Pills/tablets per intake:',
          answer: [
            {
              valueDecimal: 1.0,
            },
          ],
        },
        {
          linkId: 'sglt2i.drug',
          text: 'Which pill/tablet do you take?',
          answer: [
            {
              valueCoding: {
                id: 'medications/1545653/drugs/1545658',
                system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                code: 'medications/1545653/drugs/1545658',
                display: 'Empagliflozin (Jardiance)\n10 mg Oral Tablet',
              },
            },
          ],
        },
      ],
    },
    {
      linkId: 'diuretics.exists',
      text: 'Diuretics',
      item: [
        {
          linkId: 'diuretics.exists-description',
          text: 'Do you take any of the following medications? Bumetanide (Bumex) Ethacrynic Acid (Edecrin) Furosemide (Lasix) Torsemide (Soaanz)',
        },
        {
          linkId: 'diuretics.exists',
          text: 'Do you take any medication from the above list?',
          answer: [
            {
              valueBoolean: false,
            },
          ],
        },
      ],
    },
    {
      linkId: 'appointment.exists',
      text: 'Next appointment',
      item: [
        {
          linkId: 'appointment.exists-description',
          text: 'Next appointment',
        },
        {
          linkId: 'appointment.exists',
          text: 'Do you already have a new appointment scheduled?',
          answer: [
            {
              valueBoolean: true,
            },
          ],
        },
      ],
    },
    {
      linkId: 'appointment.page1',
      text: 'Next appointment',
      item: [
        {
          linkId: 'appointment.description',
          text: 'Upcoming appointment',
        },
        {
          linkId: 'appointment.date',
          text: 'Date:',
          answer: [
            {
              valueDate: '2025-07-12',
            },
          ],
        },
      ],
    },
  ],
}
