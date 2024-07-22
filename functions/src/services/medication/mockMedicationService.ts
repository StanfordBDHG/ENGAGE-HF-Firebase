import { type MedicationService } from './medicationService.js'
import { type FHIRMedication } from '../../models/fhir/medication.js'
import { type MedicationClass } from '../../models/medicationClass.js'
import { type DatabaseDocument } from '../database/databaseService.js'

/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */

export class MockMedicationService implements MedicationService {
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
                itemCodeableConcept: {
                  coding: [
                    {
                      system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                      code: '203160',
                      display: 'Losartan potassium',
                    },
                  ],
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
                itemCodeableConcept: {
                  coding: [
                    {
                      system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                      code: '203160',
                      display: 'Losartan potassium',
                    },
                  ],
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
                itemCodeableConcept: {
                  coding: [
                    {
                      system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                      code: '203160',
                      display: 'Losartan potassium',
                    },
                  ],
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

  // Helpers

  private makeDocument<T>(id: string, content: T): DatabaseDocument<T> {
    return {
      id: id,
      content: content,
    }
  }
}
