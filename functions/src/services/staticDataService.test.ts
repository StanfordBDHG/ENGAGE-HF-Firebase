import { expect } from 'chai'
import admin from 'firebase-admin'
import { RxNormService } from './rxNormService.js'
import { StaticDataService } from './staticDataService.js'
import { setupMockFirestore } from '../tests/setup.js'
import { TestFlags } from '../tests/testFlags.js'

describe('StaticDataService', () => {
  setupMockFirestore()
  const firestore = admin.firestore()
  const rxNormService = new RxNormService()
  const staticDataService = new StaticDataService(firestore, rxNormService)

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
