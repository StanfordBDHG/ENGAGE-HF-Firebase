//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  CodingSystem,
  DrugReference,
  FHIRExtensionUrl,
  FHIRMedication,
  FHIRMedicationRequest,
  LocalizedText,
  MedicationClass,
  MedicationClassReference,
  MedicationReference,
  UserMedicationRecommendationType,
} from '@stanfordbdhg/engagehf-models'
import { DiureticRecommender } from './diureticRecommender.js'
import { type Recommender } from './recommender.js'
import { type MedicationRequestContext } from '../../../models/medicationRequestContext.js'
import { MockContraindicationService } from '../../../tests/mocks/contraindicationService.js'
import { mockHealthSummaryData } from '../../../tests/mocks/healthSummaryData.js'
import { ContraindicationCategory } from '../../contraindication/contraindicationService.js'

describe('DiureticRecommender', () => {
  const recommender: Recommender = new DiureticRecommender(
    new MockContraindicationService(
      () => ContraindicationCategory.none,
      () => ContraindicationCategory.none,
      (_, medicationReferences) => medicationReferences.at(0),
    ),
  )

  describe('No treatment', () => {
    it('correctly does not recommend new medications', async () => {
      const healthSummaryData = await mockHealthSummaryData('')
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        latestDizzinessScore: undefined,
      })
      expect(result).toHaveLength(0)
    })
  })

  describe('On furosemide', () => {
    it('correctly keeps existing medication request', async () => {
      const existingMedication: MedicationRequestContext = {
        lastUpdate: new Date(),
        requestReference: {
          reference:
            'users/mockPatient/medicationRequests/mockMedicationRequest',
        },
        request: FHIRMedicationRequest.create({
          medicationReference: DrugReference.furosemide20,
          medicationReferenceDisplay: 'Furosemide 20mg Oral Tablet',
          frequencyPerDay: 1,
          quantity: 1,
        }),
        drugReference: {
          reference: DrugReference.furosemide20,
        },
        drug: new FHIRMedication({
          code: {
            coding: [
              {
                system: CodingSystem.rxNorm,
                code: DrugReference.furosemide20.split('/').at(-1),
                display: 'Furosemide 20mg',
              },
            ],
          },
        }),
        medicationReference: {
          reference: MedicationReference.furosemide,
        },
        medication: new FHIRMedication({
          code: {
            coding: [
              {
                system: CodingSystem.rxNorm,
                code: MedicationReference.furosemide.split('/').at(-1),
                display: 'Furosemide',
              },
            ],
          },
          extension: [
            {
              url: FHIRExtensionUrl.medicationClass,
              valueReference: {
                reference: MedicationClassReference.diuretics,
              },
            },
          ],
        }),
        medicationClass: new MedicationClass({
          name: new LocalizedText('Diuretics'),
          videoPath: 'videoSections/1/videos/5',
        }),
        medicationClassReference: {
          reference: MedicationClassReference.diuretics,
        },
      }
      const healthSummaryData = await mockHealthSummaryData('')
      const result = recommender.compute({
        requests: [existingMedication],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        latestDizzinessScore: undefined,
      })
      expect(result).toHaveLength(1)
      expect(result.at(0)).toStrictEqual({
        currentMedication: [existingMedication],
        recommendedMedication: undefined,
        type: UserMedicationRecommendationType.personalTargetDoseReached,
      })
    })
  })
})
