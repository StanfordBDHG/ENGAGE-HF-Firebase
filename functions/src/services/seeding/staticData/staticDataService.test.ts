//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { CachingStrategy } from '@stanfordbdhg/engagehf-models'
import admin from 'firebase-admin'
import { type Firestore } from 'firebase-admin/firestore'
import { type StaticDataService } from './staticDataService.js'
import { cleanupMocks, setupMockFirebase } from '../../../tests/setup.js'
import { TestFlags } from '../../../tests/testFlags.js'
import { getServiceFactory } from '../../factory/getServiceFactory.js'

describe('StaticDataService', () => {
  let firestore: Firestore
  let staticDataService: StaticDataService

  beforeAll(() => {
    setupMockFirebase()
    firestore = admin.firestore()
    staticDataService = getServiceFactory().staticData()
  })

  afterAll(() => {
    cleanupMocks()
  })

  it('actually creates medication classes', async () => {
    const medicationClasses = await firestore
      .collection('medicationClasses')
      .get()
    expect(medicationClasses.size).toBe(0)

    await staticDataService.updateMedicationClasses(CachingStrategy.expectCache)

    const updatedMedicationClasses = await firestore
      .collection('medicationClasses')
      .get()
    expect(updatedMedicationClasses.size).toBeGreaterThan(0)
  })

  it('actually creates medications and drugs', async () => {
    const medications = await firestore.collection('medications').get()
    expect(medications.size).toBe(0)

    await staticDataService.updateMedications(
      TestFlags.regenerateValues ?
        CachingStrategy.updateCache
      : CachingStrategy.expectCache,
    )

    const updatedMedications = await firestore.collection('medications').get()
    expect(updatedMedications.size).toBeGreaterThan(0)

    for (const medication of updatedMedications.docs) {
      const drugs = await medication.ref.collection('drugs').get()
      expect(drugs.size).toBeGreaterThan(0)
    }
  }, 100_000)

  it('actually creates organizations', async () => {
    const organizations = await firestore.collection('organizations').get()
    expect(organizations.size).toBe(0)

    await staticDataService.updateOrganizations(CachingStrategy.expectCache)

    const updatedOrganizations = await firestore
      .collection('organizations')
      .get()
    expect(updatedOrganizations.size).toBeGreaterThan(0)
  })

  it('actually creates questionnaires', async () => {
    const questionnaires = await firestore.collection('questionnaires').get()
    expect(questionnaires.size).toBe(0)

    await staticDataService.updateQuestionnaires(
      TestFlags.regenerateValues ?
        CachingStrategy.updateCache
      : CachingStrategy.expectCache,
    )

    const updatedQuestionnaires = await firestore
      .collection('questionnaires')
      .get()
    expect(updatedQuestionnaires.size).toBeGreaterThan(0)
  })

  it('actually creates videoSections', async () => {
    const videoSections = await firestore.collection('videoSections').get()
    expect(videoSections.size).toBe(0)

    await staticDataService.updateVideoSections(CachingStrategy.expectCache)

    const updatedVideoSections = await firestore
      .collection('videoSections')
      .get()
    expect(updatedVideoSections.size).toBeGreaterThan(0)
  })
})
