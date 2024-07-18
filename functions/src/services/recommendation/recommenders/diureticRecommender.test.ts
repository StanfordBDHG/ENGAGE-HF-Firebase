//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { expect } from 'chai'
import { describe, it } from 'mocha'
import { DiureticRecommender } from './diureticRecommender.js'
import { MedicationRecommendationCategory } from '../../../models/medicationRecommendation.js'
import { type MedicationRequestContext } from '../../../models/medicationRequestContext.js'
import { MockContraindicationService } from '../../../tests/mocks/contraindicationService.js'
import { mockHealthSummaryData } from '../../../tests/mocks/healthSummaryData.js'
import {
  CodingSystem,
  DrugReference,
  FHIRExtensionUrl,
  MedicationClassReference,
  MedicationReference,
} from '../../codes.js'
import { ContraindicationCategory } from '../../contraindication/contraindicationService.js'
import { FhirService } from '../../fhir/fhirService.js'

describe('DiureticRecommender', () => {
  const recommender = new DiureticRecommender(
    new MockContraindicationService(
      () => ContraindicationCategory.none,
      () => ContraindicationCategory.none,
    ),
    new FhirService(),
  )

  describe('No treatment', () => {
    it('correctly does not recommend new medications', () => {
      const healthSummaryData = mockHealthSummaryData()
      const result = recommender.compute({
        requests: [],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(0)
    })
  })

  describe('On furosemide', () => {
    it('correctly keeps existing medication request', () => {
      const existingMedication: MedicationRequestContext = {
        requestReference: {
          reference:
            'patients/mockPatient/medicationRequests/mockMedicationRequest',
        },
        request: {
          medicationReference: {
            reference: DrugReference.furosemide20,
          },
          dosageInstruction: [
            {
              timing: {
                repeat: {
                  timeOfDay: ['08:00'],
                },
              },
              doseAndRate: [
                {
                  doseQuantity: {
                    value: 1,
                    unit: 'tablet',
                  },
                },
              ],
            },
          ],
        },
        medicationReference: {
          reference: MedicationReference.furosemide,
        },
        medication: {
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
              valueString: MedicationClassReference.diuretics,
            },
          ],
        },
        medicationClass: {
          name: 'Diuretics',
          videoPath: 'videoSections/1/videos/5',
        },
        medicationClassReference: {
          reference: MedicationClassReference.diuretics,
        },
      }
      const healthSummaryData = mockHealthSummaryData()
      const result = recommender.compute({
        requests: [existingMedication],
        contraindications: [],
        vitals: healthSummaryData.vitals,
        symptomScores: healthSummaryData.symptomScores.at(-1),
      })
      expect(result).to.have.length(1)
      expect(result.at(0)).to.deep.equal({
        currentMedication: existingMedication.requestReference,
        recommendedMedication: undefined,
        category: MedicationRecommendationCategory.noActionRequired,
      })
    })
  })
})
