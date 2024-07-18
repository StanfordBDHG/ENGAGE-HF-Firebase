//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  AppointmentStatus,
  type Appointment,
} from '../../models/appointment.js'
import {
  type FHIRMedication,
  type FHIRMedicationRequest,
} from '../../models/fhir/medication.js'
import {
  FHIRObservationStatus,
  type FHIRObservation,
} from '../../models/fhir/observation.js'
import { type Invitation } from '../../models/invitation.js'
import { type KccqScore } from '../../models/kccqScore.js'
import { type MedicationClass } from '../../models/medicationClass.js'
import {
  type Clinician,
  type Patient,
  type User,
  type UserRecord,
} from '../../models/user.js'
import {
  type DatabaseDocument,
  type DatabaseService,
} from '../../services/database/databaseService.js'
import { QuantityUnit } from '../../services/fhir/quantityUnit.js'

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */

export class MockDatabaseService implements DatabaseService {
  // Properties

  // Methods - Appointments

  async getAppointments(
    userId: string,
  ): Promise<Array<DatabaseDocument<Appointment>>> {
    return []
  }
  async getNextAppointment(
    userId: string,
  ): Promise<DatabaseDocument<Appointment> | undefined> {
    return this.makeDocument('123', {
      status: AppointmentStatus.pending,
      created: new Date('2024-01-01'),
      start: new Date('2024-02-03'),
      end: new Date('2024-02-03'),
      participant: [userId],
    })
  }

  // Methods - Invitations

  async getInvitation(
    invitationId: string,
  ): Promise<DatabaseDocument<Invitation>> {
    return {
      id: invitationId,
      content: {
        used: true,
        usedBy: 'test',
      },
    }
  }

  async getInvitationUsedBy(
    userId: string,
  ): Promise<DatabaseDocument<Invitation> | undefined> {
    return {
      id: '123',
      content: {
        used: true,
        usedBy: userId,
      },
    }
  }

  async enrollUser(invitationId: string, userId: string): Promise<void> {
    return
  }

  // Methods - Medications

  async getMedicationClasses(): Promise<
    Array<DatabaseDocument<MedicationClass>>
  > {
    const values = [
      {
        name: 'Beta blockers',
        videoPath: '/videoSections/1/videos/0',
      },
      {
        name: {
          en: 'SGLT2 Inhibitors',
          de: 'SGLT2-Inhibitoren',
        },
        videoPath: '/videoSections/1/videos/1',
      },
      {
        name: 'Mineralocorticoid Receptor Antagonists (MRAs)',
        videoPath: '/videoSections/1/videos/2',
      },
      {
        name: 'ACE inhibitors and ARBs',
        videoPath: '/videoSections/1/videos/3',
      },
      {
        name: 'Angiotensin Receptor/Neprilysin Inhibitors (ARNI)',
        videoPath: '/videoSections/1/videos/4',
      },
      {
        name: 'Diuretics',
        videoPath: '/videoSections/1/videos/5',
      },
    ]
    return values.map((value, index) =>
      this.makeDocument(index.toString(), value),
    )
  }

  async getMedicationClass(
    medicationClassId: string,
  ): Promise<DatabaseDocument<MedicationClass>> {
    const allValues = await this.getMedicationClasses()
    const value = allValues.find((v) => v.id === medicationClassId)
    if (!value) throw new Error('Medication class does not exist')
    return value
  }

  async getMedications(): Promise<Array<DatabaseDocument<FHIRMedication>>> {
    const values: FHIRMedication[] = [
      {
        id: '1808',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1808',
              display: 'bumetanide',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '6',
          },
        ],
      },
      {
        id: '1998',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1998',
              display: 'captopril',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '3',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 18.75, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 150, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '3827',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '3827',
              display: 'enalapril',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '3',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 5, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 40, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '4109',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '4109',
              display: 'ethacrynic acid',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '6',
          },
        ],
      },
      {
        id: '4603',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '4603',
              display: 'furosemide',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '6',
          },
        ],
      },
      {
        id: '9997',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '9997',
              display: 'spironolactone',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '2',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 12.5, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 25, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '18867',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '18867',
              display: 'benazepril',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '3',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 5, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 40, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '19484',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '19484',
              display: 'bisoprolol',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '0',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 1.25, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 10, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '20352',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '20352',
              display: 'carvedilol',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '0',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 6.25, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 50, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '29046',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '29046',
              display: 'lisinopril',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '3',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 2.5, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 40, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '30131',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '30131',
              display: 'moexipril',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '3',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 7.5, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 15, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '35208',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '35208',
              display: 'quinapril',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '3',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 10, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 40, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '35296',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '35296',
              display: 'ramipril',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '3',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 1.25, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 10, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '38413',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '38413',
              display: 'torsemide',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '6',
          },
        ],
      },
      {
        id: '38454',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '38454',
              display: 'trandolapril',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '3',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 1, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 4, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '54552',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '54552',
              display: 'perindopril',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '3',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 2, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 16, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '69749',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '69749',
              display: 'valsartan',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '4',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 20, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 320, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '73494',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '73494',
              display: 'telmisartan',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '4',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 40, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 80, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '83515',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '83515',
              display: 'eprosartan',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '4',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 400, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 800, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '83818',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '83818',
              display: 'irbesartan',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '4',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 75, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 300, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '118463',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '118463',
              display: 'olmesartan medoxomil',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '4',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 10, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 40, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '203160',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '203160',
              display: 'losartan potassium',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '4',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 25, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 150, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '214354',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '214354',
              display: 'candesartan',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '4',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 4, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 32, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '221124',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '221124',
              display: 'metoprolol succinate',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '0',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 12.5, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 200, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '227278',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '227278',
              display: 'fosinopril sodium',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '3',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 5, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 40, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '298869',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '298869',
              display: 'eplerenone',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '2',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 12.5, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 50, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '668310',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '668310',
              display: 'carvedilol phosphate',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '0',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 10, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 80, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '1091642',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1091642',
              display: 'azilsartan medoxomil',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '4',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 40, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 80, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '1373458',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1373458',
              display: 'canagliflozin',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '1',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 100, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 100, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '1488564',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1488564',
              display: 'dapagliflozin',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '1',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 5, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 10, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '1545653',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1545653',
              display: 'empagliflozin',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '1',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 5, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 10, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '1656339',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1656339',
              display: 'sacubitril / valsartan',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '5',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 48, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 194, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '1992672',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1992672',
              display: 'ertugliflozin',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '1',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 5, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 15, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '2627044',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '2627044',
              display: 'bexagliflozin',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '1',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 20, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 20, unit: 'mg/day' },
          },
        ],
      },
      {
        id: '2638675',
        code: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '2638675',
              display: 'sotagliflozin',
            },
          ],
        },
        extension: [
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass',
            valueString: '1',
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose',
            valueQuantity: { value: 200, unit: 'mg/day' },
          },
          {
            url: 'http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose',
            valueQuantity: { value: 400, unit: 'mg/day' },
          },
        ],
      },
    ]
    return values.map((value, index) =>
      this.makeDocument(value.id ?? index.toString(), value),
    )
  }

  async getMedication(
    medicationId: string,
  ): Promise<DatabaseDocument<FHIRMedication>> {
    const values = await this.getMedications()
    const value = values.find((value) => value.id === medicationId)
    if (value) return value
    throw new Error(`Medication (id: ${medicationId}) does not exist`)
  }

  async getDrugs(
    medicationId: string,
  ): Promise<Array<DatabaseDocument<FHIRMedication>>> {
    switch (medicationId) {
      case '203160':
        const values: FHIRMedication[] = [
          {
            id: '979480',
            code: {
              coding: [
                {
                  system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                  code: '979480',
                  display: 'Losartan (Oral Pill)',
                },
              ],
            },
            form: {
              coding: [
                {
                  system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                  code: 'Oral Tablet',
                  display: 'Oral Tablet',
                },
              ],
            },
            ingredient: [
              {
                itemReference: {
                  reference: 'medications/203160',
                },
                strength: {
                  numerator: { value: 100, unit: 'mg' },
                  denominator: { value: 1 },
                },
              },
            ],
          },
          {
            id: '979485',
            code: {
              coding: [
                {
                  system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                  code: '979485',
                  display: 'Losartan (Oral Pill)',
                },
              ],
            },
            form: {
              coding: [
                {
                  system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                  code: 'Oral Tablet',
                  display: 'Oral Tablet',
                },
              ],
            },
            ingredient: [
              {
                itemReference: {
                  reference: 'medications/203160',
                },
                strength: {
                  numerator: { value: 25, unit: 'mg' },
                  denominator: { value: 1 },
                },
              },
            ],
          },
          {
            id: '979492',
            code: {
              coding: [
                {
                  system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                  code: '979492',
                  display: 'Losartan (Oral Pill)',
                },
              ],
            },
            form: {
              coding: [
                {
                  system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                  code: 'Oral Tablet',
                  display: 'Oral Tablet',
                },
              ],
            },
            ingredient: [
              {
                itemReference: {
                  reference: 'medications/203160',
                },
                strength: {
                  numerator: { value: 50, unit: 'mg' },
                  denominator: { value: 1 },
                },
              },
            ],
          },
        ]

        return values.map((value, index) =>
          this.makeDocument(value.id ?? index.toString(), value),
        )
      default:
        return []
    }
  }

  async getDrug(
    medicationId: string,
    drugId: string,
  ): Promise<DatabaseDocument<FHIRMedication>> {
    return this.makeDocument(drugId, {
      id: drugId,
    })
  }

  // Methods - Users

  async getClinician(userId: string): Promise<DatabaseDocument<Clinician>> {
    return {
      id: userId,
      content: {
        organization: 'stanford',
      },
    }
  }

  async getPatient(userId: string): Promise<DatabaseDocument<Patient>> {
    return this.makeDocument(userId, {
      dateOfBirth: new Date('1970-01-02'),
      clinician: 'mockClinician',
      dryWeight: {
        ...QuantityUnit.lbs,
        value: 267.5,
      },
    })
  }

  async getUser(userId: string): Promise<DatabaseDocument<User>> {
    return this.makeDocument(userId, {
      dateOfEnrollment: new Date('2024-04-02'),
      invitationCode: '123',
      messagesSettings: {
        dailyRemindersAreActive: true,
        textNotificationsAreActive: true,
        medicationRemindersAreActive: true,
      },
    })
  }

  async getUserRecord(userId: string): Promise<UserRecord> {
    switch (userId) {
      case 'mockClinician':
        return {
          displayName: 'Dr. XXX',
        }
      case 'mockUser':
        return {
          displayName: 'John Doe',
        }
      default:
        return {
          displayName: 'Unknown',
        }
    }
  }

  // Methods - Users - Medication Requests

  async getMedicationRecommendations(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRMedicationRequest>>> {
    const values: FHIRMedicationRequest[] = []
    return values.map((value, index) =>
      this.makeDocument(index.toString(), value),
    )
  }

  async getMedicationRequests(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRMedicationRequest>>> {
    const values: FHIRMedicationRequest[] = [
      {
        medicationReference: {
          reference: 'medications/203160/drugs/20352',
        },
        dosageInstruction: [
          {
            doseAndRate: [
              {
                doseQuantity: {
                  ...QuantityUnit.mg,
                  value: 6.25,
                },
              },
            ],
          },
        ],
      },
    ]
    return values.map((value, index) =>
      this.makeDocument(index.toString(), value),
    )
  }

  // Methods - Users - Messages

  async dismissMessage(
    userId: string,
    messageId: string,
    didPerformAction: boolean,
  ): Promise<void> {
    // TODO
  }

  // Methods - Users - Observations

  async getBloodPressureObservations(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRObservation>>> {
    const values = [
      this.bloodPressureObservation(110, 70, new Date('2024-02-01')),
      this.bloodPressureObservation(114, 82, new Date('2024-01-31')),
      this.bloodPressureObservation(123, 75, new Date('2024-01-30')),
      this.bloodPressureObservation(109, 77, new Date('2024-01-29')),
      this.bloodPressureObservation(105, 72, new Date('2024-01-28')),
      this.bloodPressureObservation(98, 68, new Date('2024-01-27')),
      this.bloodPressureObservation(94, 65, new Date('2024-01-26')),
      this.bloodPressureObservation(104, 72, new Date('2024-01-25')),
      this.bloodPressureObservation(102, 80, new Date('2024-01-24')),
    ]
    return values.map((value, index) =>
      this.makeDocument(index.toString(), value),
    )
  }

  private bloodPressureObservation(
    systolicBloodPressure: number,
    diastolicBloodPressure: number,
    date: Date,
  ): FHIRObservation {
    return {
      code: {
        coding: [
          {
            code: '85354-9',
            display: 'Blood pressure panel',
            system: 'http://loinc.org',
          },
        ],
      },
      component: [
        {
          code: {
            coding: [
              {
                code: '8480-6',
                display: 'Systolic blood pressure',
                system: 'http://loinc.org',
              },
              {
                code: 'HKQuantityTypeIdentifierBloodPressureSystolic',
                display: 'Blood Pressure Systolic',
                system: 'http://developer.apple.com/documentation/healthkit',
              },
            ],
          },
          valueQuantity: {
            ...QuantityUnit.mmHg,
            value: systolicBloodPressure,
          },
        },
        {
          code: {
            coding: [
              {
                code: '8462-4',
                display: 'Diastolic blood pressure',
                system: 'http://loinc.org',
              },
              {
                code: 'HKQuantityTypeIdentifierBloodPressureDiastolic',
                display: 'Blood Pressure Diastolic',
                system: 'http://developer.apple.com/documentation/healthkit',
              },
            ],
          },
          valueQuantity: {
            ...QuantityUnit.mmHg,
            value: diastolicBloodPressure,
          },
        },
      ],
      effectiveDateTime: date,
      id: 'DDA0F363-2BA3-426F-9F68-1C938FFDF943',
      status: FHIRObservationStatus.final,
    }
  }

  async getBodyWeightObservations(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRObservation>>> {
    const values = [
      this.bodyWeightObservation(
        269,
        QuantityUnit.lbs,

        new Date('2024-02-01'),
      ),
      this.bodyWeightObservation(
        267,
        QuantityUnit.lbs,

        new Date('2024-01-31'),
      ),
      this.bodyWeightObservation(
        267,
        QuantityUnit.lbs,

        new Date('2024-01-30'),
      ),
      this.bodyWeightObservation(
        265,
        QuantityUnit.lbs,

        new Date('2024-01-29'),
      ),
      this.bodyWeightObservation(
        268,
        QuantityUnit.lbs,

        new Date('2024-01-28'),
      ),
      this.bodyWeightObservation(
        268,
        QuantityUnit.lbs,

        new Date('2024-01-27'),
      ),
      this.bodyWeightObservation(
        266,
        QuantityUnit.lbs,

        new Date('2024-01-26'),
      ),
      this.bodyWeightObservation(266, QuantityUnit.lbs, new Date('2024-01-25')),
      this.bodyWeightObservation(267, QuantityUnit.lbs, new Date('2024-01-24')),
    ]
    return values.map((value, index) =>
      this.makeDocument(index.toString(), value),
    )
  }

  private bodyWeightObservation(
    value: number,
    unit: QuantityUnit,
    date: Date,
  ): FHIRObservation {
    return {
      code: {
        coding: [
          {
            code: '29463-7',
            display: 'Body weight',
            system: 'http://loinc.org',
          },
          {
            code: 'HKQuantityTypeIdentifierBodyMass',
            display: 'Body Mass',
            system: 'http://developer.apple.com/documentation/healthkit',
          },
        ],
      },
      effectiveDateTime: date,
      status: FHIRObservationStatus.final,
      valueQuantity: {
        ...unit,
        value,
      },
    }
  }

  async getHeartRateObservations(
    userId: string,
  ): Promise<Array<DatabaseDocument<FHIRObservation>>> {
    const values = [
      this.heartRateObservation(79, new Date('2024-02-01')),
      this.heartRateObservation(62, new Date('2024-01-31')),
      this.heartRateObservation(77, new Date('2024-01-30')),
      this.heartRateObservation(63, new Date('2024-01-29')),
      this.heartRateObservation(61, new Date('2024-01-28')),
      this.heartRateObservation(70, new Date('2024-01-27')),
      this.heartRateObservation(67, new Date('2024-01-26')),
      this.heartRateObservation(80, new Date('2024-01-25')),
      this.heartRateObservation(65, new Date('2024-01-24')),
    ]
    return values.map((value, index) =>
      this.makeDocument(index.toString(), value),
    )
  }

  private heartRateObservation(value: number, date: Date): FHIRObservation {
    return {
      code: {
        coding: [
          {
            code: '8867-4',
            display: 'Heart rate',
            system: 'http://loinc.org',
          },
          {
            code: 'HKQuantityTypeIdentifierHeartRate',
            display: 'Heart Rate',
            system: 'http://developer.apple.com/documentation/healthkit',
          },
        ],
      },
      effectiveDateTime: date,
      id: 'C38FFD7E-7B86-4C79-9C8A-0B90E2F3DF14',
      status: FHIRObservationStatus.final,
      valueQuantity: {
        ...QuantityUnit.bpm,
        value: value,
      },
    }
  }

  // Methods - Users - Questionnaire Responses

  async getKccqScores(
    userId: string,
  ): Promise<Array<DatabaseDocument<KccqScore>>> {
    const values = [
      {
        overallScore: 40,
        physicalLimitsScore: 50,
        socialLimitsScore: 38,
        qualityOfLifeScore: 20,
        specificSymptomsScore: 60,
        dizzinessScore: 50,
        date: new Date('2024-01-24'),
      },
      {
        overallScore: 60,
        physicalLimitsScore: 58,
        socialLimitsScore: 75,
        qualityOfLifeScore: 37,
        specificSymptomsScore: 72,
        dizzinessScore: 70,
        date: new Date('2024-01-15'),
      },
      {
        overallScore: 44,
        physicalLimitsScore: 50,
        socialLimitsScore: 41,
        qualityOfLifeScore: 25,
        specificSymptomsScore: 60,
        dizzinessScore: 50,
        date: new Date('2023-12-30'),
      },
      {
        overallScore: 75,
        physicalLimitsScore: 58,
        socialLimitsScore: 75,
        qualityOfLifeScore: 60,
        specificSymptomsScore: 80,
        dizzinessScore: 100,
        date: new Date('2023-12-15'),
      },
    ]
    return values.map((value, index) =>
      this.makeDocument(index.toString(), value),
    )
  }

  // Helpers

  private makeDocument<T>(
    id: string,
    content: T | undefined,
  ): DatabaseDocument<T> {
    return {
      id: id,
      content: content,
    }
  }
}
