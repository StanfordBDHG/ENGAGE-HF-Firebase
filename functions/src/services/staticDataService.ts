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
    firestore: Firestore,
    rxNormService: RxNormService,
    path = './data/',
  ) {
    this.db = firestore
    this.rxNormService = rxNormService
    this.path = path
  }

  // Methods

  async updateAll() {
    await Promise.all([
      this.updateMedicationClasses(),
      this.updateMedications(),
      this.updateQuestionnaires(),
      this.updateVideoSections(),
    ])
  }

  async updateMedications() {
    const data = await this.readJSON('medicationCodes.json')
    const { medications, drugs } =
      await this.rxNormService.buildFHIRCollections(data)
    await this.db.runTransaction(async (transaction) => {
      await this.deleteCollection('medications', transaction)
      this.setUnstructuredCollection(
        this.db.collection('medications'),
        medications,
        transaction,
      )
      for (const medicationId in drugs) {
        this.setUnstructuredCollection(
          this.db
            .collection('medications')
            .doc(medicationId)
            .collection('drugs'),
          drugs[medicationId],
          transaction,
        )
      }
    })
  }

  async updateMedicationClasses() {
    await this.db.runTransaction(async (transaction) => {
      await this.deleteCollection('medicationClasses', transaction)
      this.setStructuredCollection(
        this.db.collection('medicationClasses'),
        this.readJSON('medicationClasses.json'),
        transaction,
      )
    })
  }

  async updateQuestionnaires() {
    await this.db.runTransaction(async (transaction) => {
      await this.deleteCollection('questionnaires', transaction)
      this.setUnstructuredCollection(
        this.db.collection('questionnaires'),
        this.readJSON('questionnaires.json'),
        transaction,
      )
    })
  }

  async updateVideoSections() {
    await this.db.runTransaction(async (transaction) => {
      await this.deleteCollection('videoSections', transaction)
      this.setStructuredCollection(
        this.db.collection('videoSections'),
        this.readJSON('videoSections.json'),
        transaction,
      )
    })
  }

  // Helpers

  private setUnstructuredCollection(
    collection: any,
    data: any,
    transaction: FirebaseFirestore.Transaction,
  ) {
    if (Array.isArray(data)) {
      for (let index = 0; index < data.length; index++) {
        const document =
          this.useIndicesAsKeys ?
            collection.doc(String(index))
          : collection.doc()
        transaction.set(document, data[index])
      }
    } else {
      for (const key of Object.keys(data)) {
        transaction.set(collection.doc(key), data[key])
      }
    }
  }

  private setStructuredCollection(
    collection: any,
    data: any,
    transaction: FirebaseFirestore.Transaction,
  ) {
    if (Array.isArray(data)) {
      for (let index = 0; index < data.length; index++) {
        const document =
          this.useIndicesAsKeys ?
            collection.doc(String(index))
          : collection.doc()
        this.setStructuredDocument(document, data[index], transaction)
      }
    } else {
      for (const key of Object.keys(data)) {
        this.setStructuredDocument(collection.doc(key), data[key], transaction)
      }
    }
  }

  private setStructuredDocument(
    document: any,
    data: any,
    transaction: FirebaseFirestore.Transaction,
  ) {
    if (typeof data !== 'object') {
      transaction.set(document, data)
    } else {
      const dataWithoutSubcollections: Record<string, any> = {}
      for (const key of Object.keys(data)) {
        const value = data[key]
        if (Array.isArray(value)) {
          this.setStructuredCollection(
            document.collection(key),
            value,
            transaction,
          )
        } else {
          dataWithoutSubcollections[key] = value
        }
      }
      transaction.set(document, dataWithoutSubcollections)
    }
  }

  private async deleteCollection(
    name: string,
    transaction: FirebaseFirestore.Transaction,
  ) {
    const result = await transaction.get(this.db.collection(name))
    for (const doc of result.docs) {
      transaction.delete(doc.ref)
    }
  }

  private readJSON(filename: string) {
    return JSON.parse(fs.readFileSync(this.path + filename, 'utf8'))
  }
}
