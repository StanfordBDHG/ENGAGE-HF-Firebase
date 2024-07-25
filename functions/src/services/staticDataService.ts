//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import fs from 'fs'
import { type Firestore } from 'firebase-admin/firestore'
import { type DatabaseService } from './database/databaseService.js'
import { type RxNormService } from './rxNormService.js'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

export class StaticDataService {
  // Properties

  private databaseService: DatabaseService
  private useIndicesAsKeys = true
  private path: string
  private rxNormService: RxNormService

  // Constructor

  constructor(
    databaseService: DatabaseService,
    rxNormService: RxNormService,
    path = './data/',
  ) {
    this.databaseService = databaseService
    this.rxNormService = rxNormService
    this.path = path
  }

  // Methods

  async updateAll() {
    await Promise.all([
      this.updateMedicationClasses(),
      this.updateMedications(),
      this.updateOrganizations(),
      this.updateQuestionnaires(),
      this.updateVideoSections(),
    ])
  }

  async updateMedications() {
    const data = await this.readJSON('medicationCodes.json')
    const { medications, drugs } =
      await this.rxNormService.buildFHIRCollections(data)
    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        await this.deleteCollection('medications', firestore, transaction)
        this.setUnstructuredCollection(
          firestore.collection('medications'),
          medications,
          transaction,
        )
        for (const medicationId in drugs) {
          this.setUnstructuredCollection(
            firestore
              .collection('medications')
              .doc(medicationId)
              .collection('drugs'),
            drugs[medicationId],
            transaction,
          )
        }
      },
    )
  }

  async updateMedicationClasses() {
    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        await this.deleteCollection('medicationClasses', firestore, transaction)
        this.setStructuredCollection(
          firestore.collection('medicationClasses'),
          this.readJSON('medicationClasses.json'),
          transaction,
        )
      },
    )
  }

  async updateOrganizations() {
    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        await this.deleteCollection('organizations', firestore, transaction)
        this.setUnstructuredCollection(
          firestore.collection('organizations'),
          this.readJSON('organizations.json'),
          transaction,
        )
      },
    )
  }

  async updateQuestionnaires() {
    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        await this.deleteCollection('questionnaires', firestore, transaction)
        this.setUnstructuredCollection(
          firestore.collection('questionnaires'),
          this.readJSON('questionnaires.json'),
          transaction,
        )
      },
    )
  }

  async updateVideoSections() {
    await this.databaseService.runTransaction(
      async (firestore, transaction) => {
        await this.deleteCollection('videoSections', firestore, transaction)
        this.setStructuredCollection(
          firestore.collection('videoSections'),
          this.readJSON('videoSections.json'),
          transaction,
        )
      },
    )
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
    firestore: Firestore,
    transaction: FirebaseFirestore.Transaction,
  ) {
    const result = await transaction.get(firestore.collection(name))
    for (const doc of result.docs) {
      transaction.delete(doc.ref)
    }
  }

  private readJSON(filename: string) {
    return JSON.parse(fs.readFileSync(this.path + filename, 'utf8'))
  }
}
