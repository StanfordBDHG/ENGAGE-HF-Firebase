//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { expect } from 'chai'
import admin from 'firebase-admin'
import { type Firestore } from 'firebase-admin/firestore'
import { RxNormService } from './rxNormService.js'
import { StaticDataService } from './staticDataService.js'
import { cleanupMocks, setupMockFirestore } from '../tests/setup.js'
import { TestFlags } from '../tests/testFlags.js'

describe('StaticDataService', () => {
  let firestore: Firestore
  let staticDataService: StaticDataService

  before(() => {
    setupMockFirestore()
    firestore = admin.firestore()
    staticDataService = new StaticDataService(firestore, new RxNormService())
  })

  after(() => {
    cleanupMocks()
  })

  it('actually creates admins', async () => {
    const admins = await firestore.collection('admins').get()
    expect(admins.size).to.equal(0)

    await staticDataService.updateAdmins()

    const updatedAdmins = await firestore.collection('admins').get()
    expect(updatedAdmins.size).to.be.greaterThan(0)
  })

  it('actually creates medication classes', async () => {
    const medicationClasses = await firestore
      .collection('medicationClasses')
      .get()
    expect(medicationClasses.size).to.equal(0)

    await staticDataService.updateMedicationClasses()

    const updatedMedicationClasses = await firestore
      .collection('medicationClasses')
      .get()
    expect(updatedMedicationClasses.size).to.be.greaterThan(0)
  })

  if (TestFlags.forceRunExpensiveTests) {
    it('actually creates medications and drugs', async () => {
      const medications = await firestore.collection('medications').get()
      expect(medications.size).to.equal(0)

      await staticDataService.updateMedications()

      const updatedMedications = await firestore.collection('medications').get()
      expect(updatedMedications.size).to.be.greaterThan(0)

      for (const medication of updatedMedications.docs) {
        const drugs = await medication.ref.collection('drugs').get()
        expect(drugs.size).to.be.greaterThan(0)
      }
    })
  }

  it('actually creates organizations', async () => {
    const organizations = await firestore.collection('organizations').get()
    expect(organizations.size).to.equal(0)

    await staticDataService.updateOrganizations()

    const updatedOrganizations = await firestore
      .collection('organizations')
      .get()
    expect(updatedOrganizations.size).to.be.greaterThan(0)
  })

  it('actually creates questionnaires', async () => {
    const questionnaires = await firestore.collection('questionnaires').get()
    expect(questionnaires.size).to.equal(0)

    await staticDataService.updateQuestionnaires()

    const updatedQuestionnaires = await firestore
      .collection('questionnaires')
      .get()
    expect(updatedQuestionnaires.size).to.be.greaterThan(0)
  })

  it('actually creates videoSections', async () => {
    const videoSections = await firestore.collection('videoSections').get()
    expect(videoSections.size).to.equal(0)

    await staticDataService.updateVideoSections()

    const updatedVideoSections = await firestore
      .collection('videoSections')
      .get()
    expect(updatedVideoSections.size).to.be.greaterThan(0)
  })
})
