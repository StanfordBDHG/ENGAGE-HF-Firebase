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
  const staticDataService = new StaticDataService(
    './data/',
    firestore,
    rxNormService,
  )

  it('actually creates static data', async () => {
    if (!TestFlags.forceRunExpensiveTests) {
      console.log('Skipping expensive test')
      return
    }

    const medicationClasses = await firestore
      .collection('medicationClasses')
      .get()
    expect(medicationClasses.size).to.equal(0)

    const medications = await firestore.collection('medications').get()
    expect(medications.size).to.equal(0)

    const questionnaires = await firestore.collection('questionnaires').get()
    expect(questionnaires.size).to.equal(0)

    const videoSections = await firestore.collection('videoSections').get()
    expect(videoSections.size).to.equal(0)

    await staticDataService.updateAll()

    const updatedMedicationClasses = await firestore
      .collection('medicationClasses')
      .get()
    expect(updatedMedicationClasses.size).to.not.equal(0)

    const updatedMedications = await firestore.collection('medications').get()
    expect(updatedMedications.size).to.not.equal(0)
    console.log(
      JSON.stringify(updatedMedications.docs.map((med) => med.data())),
    )
    for (const medication of updatedMedications.docs) {
      const drugs = await medication.ref.collection('drugs').get()
      console.log(JSON.stringify(drugs.docs.map((med) => med.data())))
    }

    const updatedQuestionnaires = await firestore
      .collection('questionnaires')
      .get()
    expect(updatedQuestionnaires.size).to.not.equal(0)

    const updatedVideoSections = await firestore
      .collection('videoSections')
      .get()
    expect(updatedVideoSections.size).to.not.equal(0)
  })
})
