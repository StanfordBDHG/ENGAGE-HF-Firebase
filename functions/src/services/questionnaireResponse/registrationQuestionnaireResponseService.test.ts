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
} from "@stanfordbdhg/engagehf-models";
import { _defaultSeed } from "../../functions/defaultSeed.js";
import { onUserQuestionnaireResponseWritten } from "../../functions/onUserQuestionnaireResponseWritten.js";
import { _updateStaticData } from "../../functions/updateStaticData.js";
import { describeWithEmulators } from "../../tests/functions/testEnvironment.js";

describeWithEmulators("RegistrationQuestionnaireResponseService", (env) => {
  it("should be able to extract the registration response from an Apple device", async () => {
    await _updateStaticData(env.factory, {
      only: Object.values(StaticDataComponent),
      cachingStrategy: CachingStrategy.expectCache,
    });

    const userId = await env.createUser({
      type: UserType.patient,
      organization: "stanford",
    });

    const ref = env.collections.userQuestionnaireResponses(userId).doc();
    await env.setWithTrigger(onUserQuestionnaireResponseWritten, {
      ref,
      data: fhirQuestionnaireResponseConverter.schema.parse(
        registrationResponseApple,
      ),
      params: {
        userId,
        questionnaireResponseId: ref.id,
      },
    });

    const userDoc = await env.collections.users.doc(userId).get();
    const userData = userDoc.data();
    expect(userData).toBeDefined();
    expect(userData?.dateOfBirth?.toDateString()).toBe(
      new Date("2005-05-14").toDateString(),
    );
    expect(userData?.sex).toBe(UserSex.female);

    const medicationRequests = await env.collections
      .userMedicationRequests(userId)
      .get();
    expect(medicationRequests.size).toBe(2);

    const medicationRequestsData = medicationRequests.docs.map((doc) =>
      doc.data(),
    );

    const valsartan = medicationRequestsData.find(
      (req) =>
        req.data.medicationReference?.reference ===
        "medications/69749/drugs/349201",
    )?.data;
    expect(valsartan).toBeDefined();
    expect(valsartan?.dosageInstruction?.length).toBe(1);
    const valsartanDosageInstruction = valsartan?.dosageInstruction?.at(0);
    expect(valsartanDosageInstruction?.timing?.repeat?.frequency).toBe(2);
    expect(valsartanDosageInstruction?.doseAndRate?.length).toBe(1);
    const valsartanDoseAndRate = valsartanDosageInstruction?.doseAndRate?.at(0);
    expect(valsartanDoseAndRate?.doseQuantity?.value).toBe(1.5);

    const bexagliflozin = medicationRequestsData.find(
      (req) =>
        req.data.medicationReference?.reference ===
        "medications/2627044/drugs/2637859",
    )?.data;
    expect(bexagliflozin).toBeDefined();
    expect(bexagliflozin?.dosageInstruction?.length).toBe(1);
    const bexagliflozinDosageInstruction =
      bexagliflozin?.dosageInstruction?.at(0);
    expect(bexagliflozinDosageInstruction?.timing?.repeat?.frequency).toBe(2);
    expect(bexagliflozinDosageInstruction?.doseAndRate?.length).toBe(1);
    const bexagliflozinDoseAndRate =
      bexagliflozinDosageInstruction?.doseAndRate?.at(0);
    expect(bexagliflozinDoseAndRate?.doseQuantity?.value).toBe(1.34);

    const creatinineDocs = await env.collections
      .userObservations(userId, UserObservationCollection.creatinine)
      .get();
    expect(creatinineDocs.size).toBe(1);
    expect(creatinineDocs.docs[0].data().creatinine?.value).toBe(15);

    const egfrDocs = await env.collections
      .userObservations(userId, UserObservationCollection.eGfr)
      .get();
    expect(egfrDocs.size).toBe(1);
    expect(
      egfrDocs.docs[0].data().estimatedGlomerularFiltrationRate?.value,
    ).toBeCloseTo(3.2081660764751323, 5);

    const potassiumDocs = await env.collections
      .userObservations(userId, UserObservationCollection.potassium)
      .get();
    expect(potassiumDocs.size).toBe(1);
    expect(potassiumDocs.docs[0].data().potassium?.value).toBe(1.75);

    const dryWeightDocs = await env.collections
      .userObservations(userId, UserObservationCollection.dryWeight)
      .get();
    expect(dryWeightDocs.size).toBe(0);

    const appointments = await env.collections.userAppointments(userId).get();
    expect(appointments.size).toBe(1);
    expect(appointments.docs[0].data().startDate?.toISOString()).toBe(
      "2025-05-14T12:00:00.000Z",
    );
  });

  it("should be able to extract the registration response from an Android device", async () => {
    await _updateStaticData(env.factory, {
      only: Object.values(StaticDataComponent),
      cachingStrategy: CachingStrategy.expectCache,
    });

    const userId = await env.createUser({
      type: UserType.patient,
      organization: "stanford",
    });

    const ref = env.collections.userQuestionnaireResponses(userId).doc();
    await env.setWithTrigger(onUserQuestionnaireResponseWritten, {
      ref,
      data: fhirQuestionnaireResponseConverter.schema.parse(
        registrationResponseAndroid,
      ),
      params: {
        userId,
        questionnaireResponseId: ref.id,
      },
    });

    const userDoc = await env.collections.users.doc(userId).get();
    const userData = userDoc.data();
    expect(userData).toBeDefined();
    expect(userData?.dateOfBirth?.toDateString()).toBe(
      new Date("2004-10-21").toDateString(),
    );
    expect(userData?.sex).toBe(UserSex.male);

    const medicationRequests = await env.collections
      .userMedicationRequests(userId)
      .get();
    expect(medicationRequests.size).toBe(2);
    const medicationRequestsData = medicationRequests.docs.map((doc) =>
      doc.data(),
    );

    const benazepril = medicationRequestsData.find(
      (req) =>
        req.data.medicationReference?.reference ===
        "medications/18867/drugs/898719",
    )?.data;
    expect(benazepril).toBeDefined();
    expect(benazepril?.dosageInstruction?.length).toBe(1);
    const benazeprilDosageInstruction = benazepril?.dosageInstruction?.at(0);
    expect(benazeprilDosageInstruction?.timing?.repeat?.frequency).toBe(2);
    expect(benazeprilDosageInstruction?.doseAndRate?.length).toBe(1);
    const benazeprilDoseAndRate =
      benazeprilDosageInstruction?.doseAndRate?.at(0);
    expect(benazeprilDoseAndRate?.doseQuantity?.value).toBe(0.5);

    const empagliflozin = medicationRequestsData.find(
      (req) =>
        req.data.medicationReference?.reference ===
        "medications/1545653/drugs/1545658",
    )?.data;
    expect(empagliflozin).toBeDefined();
    expect(empagliflozin?.dosageInstruction?.length).toBe(1);
    const empagliflozinDosageInstruction =
      empagliflozin?.dosageInstruction?.at(0);
    expect(empagliflozinDosageInstruction?.timing?.repeat?.frequency).toBe(3);
    expect(empagliflozinDosageInstruction?.doseAndRate?.length).toBe(1);
    const empagliflozinDoseAndRate =
      empagliflozinDosageInstruction?.doseAndRate?.at(0);
    expect(empagliflozinDoseAndRate?.doseQuantity?.value).toBe(1);

    const creatinineDocs = await env.collections
      .userObservations(userId, UserObservationCollection.creatinine)
      .get();
    expect(creatinineDocs.size).toBe(1);
    expect(creatinineDocs.docs[0].data().creatinine?.value).toBe(4.5);

    const egfrDocs = await env.collections
      .userObservations(userId, UserObservationCollection.eGfr)
      .get();
    expect(egfrDocs.size).toBe(1);
    expect(
      egfrDocs.docs[0].data().estimatedGlomerularFiltrationRate?.value,
    ).toBeCloseTo(18.289641589254195, 5);

    const potassiumDocs = await env.collections
      .userObservations(userId, UserObservationCollection.potassium)
      .get();
    expect(potassiumDocs.size).toBe(0);

    const dryWeightDocs = await env.collections
      .userObservations(userId, UserObservationCollection.dryWeight)
      .get();
    expect(dryWeightDocs.size).toBe(1);
    expect(
      dryWeightDocs.docs[0].data().dryWeight(QuantityUnit.lbs)?.value,
    ).toBe(150);

    const appointments = await env.collections.userAppointments(userId).get();
    expect(appointments.size).toBe(1);
    expect(appointments.docs[0].data().startDate?.toDateString()).toBe(
      new Date("2025-07-12").toDateString(),
    );
  });
});

const registrationResponseApple = {
  authored: "2025-05-14T21:00:08.836575031+02:00",
  resourceType: "QuestionnaireResponse",
  item: [
    {
      answer: [{ valueDate: "2005-05-14" }],
      linkId: "personal-information.dateOfBirth",
    },
    {
      answer: [
        {
          valueCoding: {
            system: "engage-hf-sex",
            code: "female",
            display: "Female",
          },
        },
      ],
      linkId: "personal-information.sex",
    },
    { answer: [{ valueBoolean: true }], linkId: "lab.2160-0.exists" },
    { answer: [{ valueDecimal: 15 }], linkId: "lab.2160-0.value" },
    {
      answer: [{ valueDateTime: "2025-05-14T12:00:00Z" }],
      linkId: "lab.2160-0.dateTime",
    },
    { linkId: "lab.6298-4.exists", answer: [{ valueBoolean: true }] },
    { linkId: "lab.6298-4.value", answer: [{ valueDecimal: 1.75 }] },
    {
      answer: [{ valueDateTime: "2025-05-14T12:00:00Z" }],
      linkId: "lab.6298-4.dateTime",
    },
    { answer: [{ valueBoolean: false }], linkId: "lab.8340-2.exists" },
    {
      linkId: "medication.betablockers.exists",
      answer: [
        {
          valueCoding: {
            code: "no",
            display: "No",
            system:
              "http://engagehf.bdh.stanford.edu/fhir/ValueSet/medication-exists-registration",
          },
        },
      ],
    },
    {
      linkId: "medication.rasi.exists",
      answer: [
        {
          valueCoding: {
            code: "yes",
            display: "Yes",
            system:
              "http://engagehf.bdh.stanford.edu/fhir/ValueSet/medication-exists-registration",
          },
        },
      ],
    },
    { linkId: "medication.rasi.frequency", answer: [{ valueInteger: 2 }] },
    { linkId: "medication.rasi.quantity", answer: [{ valueDecimal: 1.5 }] },
    {
      answer: [
        {
          valueCoding: {
            system: "http://www.nlm.nih.gov/research/umls/rxnorm",
            code: "medications/69749/drugs/349201",
            display: "Valsartan (Diovan)\n160 mg Oral Tablet",
          },
        },
      ],
      linkId: "medication.rasi.drug",
    },
    {
      linkId: "medication.mra.exists",
      answer: [
        {
          valueCoding: {
            code: "no",
            display: "No",
            system:
              "http://engagehf.bdh.stanford.edu/fhir/ValueSet/medication-exists-registration",
          },
        },
      ],
    },
    {
      linkId: "medication.sglt2i.exists",
      answer: [
        {
          valueCoding: {
            code: "yes",
            display: "Yes",
            system:
              "http://engagehf.bdh.stanford.edu/fhir/ValueSet/medication-exists-registration",
          },
        },
      ],
    },
    { linkId: "medication.sglt2i.frequency", answer: [{ valueInteger: 2 }] },
    { answer: [{ valueDecimal: 1.34 }], linkId: "medication.sglt2i.quantity" },
    {
      answer: [
        {
          valueCoding: {
            display: "Bexagliflozin (Brenzavvy)\n20 mg Oral Tablet",
            system: "http://www.nlm.nih.gov/research/umls/rxnorm",
            code: "medications/2627044/drugs/2637859",
          },
        },
      ],
      linkId: "medication.sglt2i.drug",
    },
    {
      answer: [
        {
          valueCoding: {
            code: "no",
            display: "No",
            system:
              "http://engagehf.bdh.stanford.edu/fhir/ValueSet/medication-exists-registration",
          },
        },
      ],
      linkId: "medication.diuretics.exists",
    },
    { answer: [{ valueBoolean: true }], linkId: "appointment.exists" },
    {
      linkId: "appointment.dateTime",
      answer: [{ valueDateTime: "2025-05-14T12:00:00Z" }],
    },
  ],
  id: "D8083543-1DED-491E-9AEB-771E3FECB70C",
  questionnaire: "http://spezi.health/fhir/questionnaire/engagehf-registration",
  status: "completed",
};

const registrationResponseAndroid = {
  resourceType: "QuestionnaireResponse",
  questionnaire: "http://spezi.health/fhir/questionnaire/engagehf-registration",
  status: "completed",
  item: [
    {
      linkId: "de981575-bd5b-4d84-95bb-35ed6c7f5923",
      text: "Welcome to the ENGAGE-HF study! Please complete the following survey to help us understand your health and well-being.",
    },
    {
      linkId: "personal-information",
      text: "Personal information",
      item: [
        {
          linkId: "personal-information.description",
          text: "Please provide the following information to help us understand your health and well-being.",
        },
        {
          linkId: "personal-information.dateOfBirth",
          text: "Date of Birth",
          answer: [
            {
              valueDate: "2004-10-21",
            },
          ],
        },
        {
          linkId: "personal-information.sex",
          text: "Select your sex:",
          answer: [
            {
              valueCoding: {
                id: "male",
                system: "engage-hf-sex",
                code: "male",
                display: "Male",
              },
            },
          ],
        },
      ],
    },
    {
      linkId: "lab.2160-0.exists",
      text: "Creatinine",
      item: [
        {
          linkId: "lab.2160-0.exists-description",
          text: "The creatinine level in your body helps understand how your kidneys handle the drugs you are taking.",
        },
        {
          linkId: "lab.2160-0.exists",
          text: "Have you recently received a new creatinine value?",
          answer: [
            {
              valueBoolean: true,
            },
          ],
        },
      ],
    },
    {
      linkId: "lab.2160-0.page1",
      text: "Creatinine",
      item: [
        {
          linkId: "lab.2160-0.description",
          text: "The creatinine level in your body helps understand how your kidneys handle the drugs you are taking.",
        },
        {
          linkId: "lab.2160-0.value",
          text: "Creatinine (mg/dL):",
          answer: [
            {
              valueDecimal: 4.5,
            },
          ],
        },
        {
          linkId: "lab.2160-0.dateTime",
          text: "Date:",
          answer: [
            {
              valueDateTime: "2024-10-12T12:00:00Z",
            },
          ],
        },
      ],
    },
    {
      linkId: "lab.98979-8.exists",
      text: "eGFR",
      item: [
        {
          linkId: "lab.98979-8.exists-description",
          text: "eGFR (estimated Glomerular Filtration Rate) is a test that estimates how well your kidneys are filtering blood.",
        },
        {
          linkId: "lab.98979-8.exists",
          text: "Have you recently received a new eGFR value?",
          answer: [
            {
              valueBoolean: true,
            },
          ],
        },
      ],
    },
    {
      linkId: "lab.6298-4.exists",
      text: "Potassium",
      item: [
        {
          linkId: "lab.6298-4.exists-description",
          text: "The potassium level in your body helps understand how your liver handles the drugs you are taking.",
        },
        {
          linkId: "lab.6298-4.exists",
          text: "Have you recently received a new potassium value?",
          answer: [
            {
              valueBoolean: false,
            },
          ],
        },
      ],
    },
    {
      linkId: "lab.8340-2.exists",
      text: "Dry Weight",
      item: [
        {
          linkId: "lab.8340-2.exists-description",
          text: "The dry weight is useful to set a baseline to check that your weight does not increase unnoticed.",
        },
        {
          linkId: "lab.8340-2.exists",
          text: "Have you recently received a new dry weight value?",
          answer: [
            {
              valueBoolean: true,
            },
          ],
        },
      ],
    },
    {
      linkId: "lab.8340-2.page1",
      text: "Dry Weight",
      item: [
        {
          linkId: "lab.8340-2.description",
          text: "The dry weight is useful to set a baseline to check that your weight does not increase unnoticed.",
        },
        {
          linkId: "lab.8340-2.value",
          text: "Dry Weight (lbs):",
          answer: [
            {
              valueDecimal: 150.0,
            },
          ],
        },
        {
          linkId: "lab.8340-2.dateTime",
          text: "Date:",
          answer: [
            {
              valueDateTime: "2025-04-03T12:00:00Z",
            },
          ],
        },
      ],
    },
    {
      linkId: "medication.betablockers.exists",
      text: "Beta Blockers",
      item: [
        {
          linkId: "medication.betablockers.exists-description",
          text: "Do you take any of the following medications? Bisoprolol (Zebeta) Carvedilol (Coreg) Metoprolol Succinate (Toprol XL) Carvedilol Phosphate (Coreg CR)",
        },
        {
          linkId: "medication.betablockers.exists",
          text: "Do you take any medication from the above list?",
          answer: [
            {
              valueCoding: {
                code: "no",
                display: "No",
                system:
                  "http://engagehf.bdh.stanford.edu/fhir/ValueSet/medication-exists-registration",
              },
            },
          ],
        },
      ],
    },
    {
      linkId: "medication.rasi.exists",
      text: "Renin-Angiotensin System Inhibitors (RASI)",
      item: [
        {
          linkId: "medication.rasi.exists-description",
          text: "Do you take any of the following medications? Captopril (Capoten) Enalapril (Vasotec) Benazepril (Lotensin) Lisinopril (Zestril) Moexipril (Univasc) Quinapril (Accupril) Ramipril (Altace) Trandolapril (Mavik) Perindopril (Aceon) Valsartan (Diovan) Telmisartan (Micardis) Eprosartan (Teveten) Irbesartan (Avapro) Olmesartan Medoxomil (Benicar) Losartan Potassium (Cozaar) Candesartan (Atacand) Fosinopril Sodium (Monopril) Azilsartan Medoxomil (Edarbi)",
        },
        {
          linkId: "medication.rasi.exists",
          text: "Do you take any medication from the above list?",
          answer: [
            {
              valueCoding: {
                code: "yes",
                display: "Yes",
                system:
                  "http://engagehf.bdh.stanford.edu/fhir/ValueSet/medication-exists-registration",
              },
            },
          ],
        },
      ],
    },
    {
      linkId: "medication.rasi.page1",
      text: "Renin-Angiotensin System Inhibitors (RASI)",
      item: [
        {
          linkId: "medication.rasi.description",
          text: "Please enter which drug you are taking, how often you take it per day and how many pills/tablets you take per intake. Do not enter the total amount of pills/tablets you take per day.",
        },
        {
          linkId: "medication.rasi.frequency",
          text: "Intake frequency (per day):",
          answer: [
            {
              valueInteger: 2,
            },
          ],
        },
        {
          linkId: "medication.rasi.quantity",
          text: "Pills/tablets per intake:",
          answer: [
            {
              valueDecimal: 0.5,
            },
          ],
        },
        {
          linkId: "medication.rasi.drug",
          text: "Which pill/tablet do you take?",
          answer: [
            {
              valueCoding: {
                id: "medications/18867/drugs/898719",
                system: "http://www.nlm.nih.gov/research/umls/rxnorm",
                code: "medications/18867/drugs/898719",
                display: "Benazepril (Lotensin)\n40 mg Oral Tablet",
              },
            },
          ],
        },
      ],
    },
    {
      linkId: "medication.mra.exists",
      text: "Mineralocorticoid Receptor Antagonists (MRA)",
      item: [
        {
          linkId: "medication.mra.exists-description",
          text: "Do you take any of the following medications? Spironolactone (Aldactone) Eplerenone (Inspra)",
        },
        {
          linkId: "medication.mra.exists",
          text: "Do you take any medication from the above list?",
          answer: [
            {
              valueCoding: {
                code: "no",
                display: "No",
                system:
                  "http://engagehf.bdh.stanford.edu/fhir/ValueSet/medication-exists-registration",
              },
            },
          ],
        },
      ],
    },
    {
      linkId: "medication.sglt2i.exists",
      text: "medication.SGLT2 Inhibitors (SGLT2i)",
      item: [
        {
          linkId: "medication.sglt2i.exists-description",
          text: "Do you take any of the following medications? Canagliflozin (Invokana) Dapagliflozin (Farxiga) Empagliflozin (Jardiance) Ertugliflozin (Steglatro) Bexagliflozin (Brenzavvy) Sotagliflozin (Inpefa)",
        },
        {
          linkId: "medication.sglt2i.exists",
          text: "Do you take any medication from the above list?",
          answer: [
            {
              valueCoding: {
                code: "yes",
                display: "Yes",
                system:
                  "http://engagehf.bdh.stanford.edu/fhir/ValueSet/medication-exists-registration",
              },
            },
          ],
        },
      ],
    },
    {
      linkId: "medication.sglt2i.page1",
      text: "SGLT2 Inhibitors (SGLT2i)",
      item: [
        {
          linkId: "medication.sglt2i.description",
          text: "Please enter which drug you are taking, how often you take it per day and how many pills/tablets you take per intake. Do not enter the total amount of pills/tablets you take per day.",
        },
        {
          linkId: "medication.sglt2i.frequency",
          text: "Intake frequency (per day):",
          answer: [
            {
              valueInteger: 3,
            },
          ],
        },
        {
          linkId: "medication.sglt2i.quantity",
          text: "Pills/tablets per intake:",
          answer: [
            {
              valueDecimal: 1.0,
            },
          ],
        },
        {
          linkId: "medication.sglt2i.drug",
          text: "Which pill/tablet do you take?",
          answer: [
            {
              valueCoding: {
                id: "medications/1545653/drugs/1545658",
                system: "http://www.nlm.nih.gov/research/umls/rxnorm",
                code: "medications/1545653/drugs/1545658",
                display: "Empagliflozin (Jardiance)\n10 mg Oral Tablet",
              },
            },
          ],
        },
      ],
    },
    {
      linkId: "medication.diuretics.exists",
      text: "Diuretics",
      item: [
        {
          linkId: "medication.diuretics.exists-description",
          text: "Do you take any of the following medications? Bumetanide (Bumex) Ethacrynic Acid (Edecrin) Furosemide (Lasix) Torsemide (Soaanz)",
        },
        {
          linkId: "medication.diuretics.exists",
          text: "Do you take any medication from the above list?",
          answer: [
            {
              valueCoding: {
                code: "no",
                display: "No",
                system:
                  "http://engagehf.bdh.stanford.edu/fhir/ValueSet/medication-exists-registration",
              },
            },
          ],
        },
      ],
    },
    {
      linkId: "appointment.exists",
      text: "Next appointment",
      item: [
        {
          linkId: "appointment.exists-description",
          text: "Next appointment",
        },
        {
          linkId: "appointment.exists",
          text: "Do you already have a new appointment scheduled?",
          answer: [
            {
              valueBoolean: true,
            },
          ],
        },
      ],
    },
    {
      linkId: "appointment.page1",
      text: "Next appointment",
      item: [
        {
          linkId: "appointment.description",
          text: "Upcoming appointment",
        },
        {
          linkId: "appointment.dateTime",
          text: "Date:",
          answer: [
            {
              valueDateTime: "2025-07-12T12:00:00Z",
            },
          ],
        },
      ],
    },
  ],
};
