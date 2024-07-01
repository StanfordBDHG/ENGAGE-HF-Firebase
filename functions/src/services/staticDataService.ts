import fs from 'fs'
import { type Firestore } from 'firebase-admin/firestore'
import { type RxNormService } from './rxNormService.js'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

export class StaticDataService {
  // Properties

  private db: Firestore
  private useIndicesAsKeys = true
  private path: string
  private rxNormService: RxNormService

  // Constructor

  constructor(
    path: string,
    firestore: Firestore,
    rxNormService: RxNormService,
  ) {
    console.log(fs.readdirSync(path))
    this.db = firestore
    this.path = path
    this.rxNormService = rxNormService
  }

  // Methods

  async updateAll() {
    await this.updateMedicationClasses()
    await this.updateMedications()
    await this.updateQuestionnaires()
    await this.updateVideoSections()
  }

  async updateMedications() {
    const data = await this.readJSON('medicationCodes.json')
    const { medications, drugs } =
      await this.rxNormService.buildFHIRCollections(data)
    await this.setUnstructuredCollection(
      this.db.collection('medications'),
      medications,
    )
    for (const medicationId in drugs) {
      await this.setUnstructuredCollection(
        this.db.collection('medications').doc(medicationId).collection('drugs'),
        drugs[medicationId],
      )
    }
  }

  async updateMedicationClasses() {
    await this.setStructuredCollection(
      this.db.collection('medicationClasses'),
      this.readJSON('medicationClasses.json'),
    )
  }

  async updateQuestionnaires() {
    await this.setUnstructuredCollection(
      this.db.collection('questionnaires'),
      this.readJSON('questionnaires.json'),
    )
  }

  async updateVideoSections() {
    await this.setStructuredCollection(
      this.db.collection('videoSections'),
      this.readJSON('videoSections.json'),
    )
  }

  // Helpers

  async setUnstructuredCollection(collection: any, data: any) {
    if (Array.isArray(data)) {
      for (let index = 0; index < data.length; index++) {
        const document =
          this.useIndicesAsKeys ?
            collection.doc(String(index))
          : collection.doc()
        await document.set(data[index])
      }
    } else {
      for (const key of Object.keys(data)) {
        collection.doc(key).set(data[key])
      }
    }
  }

  async setStructuredCollection(collection: any, data: any) {
    if (Array.isArray(data)) {
      for (let index = 0; index < data.length; index++) {
        const document =
          this.useIndicesAsKeys ?
            collection.doc(String(index))
          : collection.doc()
        await this.setStructuredDocument(document, data[index])
      }
    } else {
      for (const key of Object.keys(data)) {
        await this.setStructuredDocument(collection.doc(key), data[key])
      }
    }
  }

  async setStructuredDocument(document: any, data: any) {
    if (typeof data !== 'object') {
      await document.set(data)
    } else {
      const dataWithoutSubcollections: Record<string, any> = {}
      for (const key of Object.keys(data)) {
        const value = data[key]
        if (Array.isArray(value)) {
          await this.setStructuredCollection(document.collection(key), value)
        } else {
          dataWithoutSubcollections[key] = value
        }
      }
      await document.set(dataWithoutSubcollections)
    }
  }

  readJSON(filename: string) {
    return JSON.parse(fs.readFileSync(this.path + filename, 'utf8'))
  }
}
